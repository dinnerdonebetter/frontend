import { AxiosError, AxiosResponse } from 'axios';
import { formatRelative } from 'date-fns';
import {
  Button,
  Center,
  Container,
  Divider,
  Text,
  List,
  Paper,
  Select,
  Table,
  TextInput,
  Title,
  Stack,
  Grid,
  Group,
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { useForm, zodResolver } from '@mantine/form';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import router from 'next/router';
import { useState } from 'react';
import { IconUpload, IconX, IconPhoto } from '@tabler/icons';
import { z } from 'zod';

import {
  User,
  HouseholdInvitation,
  QueryFilteredResult,
  ServiceSetting,
  ServiceSettingConfiguration,
  PasswordUpdateInput,
  AvatarUpdateInput,
} from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';

declare interface HouseholdSettingsPageProps {
  user: User;
  invitations: HouseholdInvitation[];
  allSettings: ServiceSetting[];
  configuredSettings: ServiceSettingConfiguration[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<HouseholdSettingsPageProps>> => {
  const span = serverSideTracer.startSpan('UserSettingsPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'USER_SETTINGS_PAGE', context, {
      householdID: userSessionData.householdID,
    });
  }

  const userPromise = apiClient.self().then((result: AxiosResponse<User>) => {
    span.addEvent('user info retrieved');
    return result.data;
  });

  const invitationsPromise = apiClient
    .getReceivedInvites()
    .then((result: AxiosResponse<QueryFilteredResult<HouseholdInvitation>>) => {
      span.addEvent('invitations retrieved');
      return result.data;
    });

  const allSettingsPromise = apiClient
    .getServiceSettings()
    .then((result: AxiosResponse<QueryFilteredResult<ServiceSetting>>) => {
      span.addEvent('service settings retrieved');
      return result.data;
    });

  const rawUserSettingsPromise = apiClient
    .getServiceSettingConfigurationsForUser()
    .then((result: AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>) => {
      span.addEvent('service setting configurationss retrieved');
      return result.data;
    });

  const [user, invitations, allSettings, rawUserSettings] = await Promise.all([
    userPromise,
    invitationsPromise,
    allSettingsPromise,
    rawUserSettingsPromise,
  ]);

  span.end();
  return {
    props: {
      user,
      invitations: invitations.data,
      configuredSettings: rawUserSettings.data || [],
      allSettings: allSettings.data || [],
    },
  };
};

const toBase64 = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString() || '');
    reader.onerror = reject;
  });

const formatDate = (x: string | undefined): string => {
  return x ? formatRelative(new Date(x), new Date()) : 'never';
};

const passwordChangeFormSchema = z.object({
  currentPassword: z.string().min(1, 'current password is required').trim(),
  newPassword: z.string().min(1, 'new password is required').trim(),
  newPasswordConfirmation: z.string().min(8, 'password confirmation required').trim(),
  totpToken: z.string().optional().or(z.string().regex(/\d{6}/, 'token must be 6 digits').trim()),
});

export default function UserSettingsPage({
  user,
  invitations,
  allSettings,
  configuredSettings,
}: HouseholdSettingsPageProps): JSX.Element {
  const apiClient = buildLocalClient();

  const [verificationRequested, setVerificationRequested] = useState(false);
  const [needsTOTPToUpdatePassword, setNeedsTOTPToUpdatePassword] = useState(false);

  const pendingInvites = (invitations || []).map((invite: HouseholdInvitation) => {
    return (
      <List.Item key={invite.id}>
        {invite.toEmail} - {invite.status}
      </List.Item>
    );
  });

  const availableSettings = allSettings.filter((setting: ServiceSetting) => {
    return !configuredSettings.find((userSetting: ServiceSettingConfiguration) => {
      return userSetting.serviceSetting.id === setting.id;
    });
  });

  const changePasswordForm = useForm({
    initialValues: {
      newPassword: '',
      currentPassword: '',
      newPasswordConfirmation: '',
      totpToken: '',
    },
    validate: zodResolver(passwordChangeFormSchema),
  });

  const requestVerificationEmail = () => {
    apiClient.requestEmailVerificationEmail().then((_res: AxiosResponse) => {
      setVerificationRequested(true);
    });
  };

  const changePassword = async () => {
    const validation = changePasswordForm.validate();
    if (validation.hasErrors) {
      console.error(validation.errors);
      return;
    }

    if (changePasswordForm.values.newPassword !== changePasswordForm.values.newPasswordConfirmation) {
      changePasswordForm.setFieldError('newPassword', 'new passwords do not match');
      changePasswordForm.setFieldError('newPasswordConfirmation', 'new passwords do not match');
      return;
    }

    const changePasswordInput = new PasswordUpdateInput({
      newPassword: changePasswordForm.values.newPassword.trim(),
      currentPassword: changePasswordForm.values.currentPassword.trim(),
      totpToken: changePasswordForm.values.totpToken.trim(),
    });

    await apiClient
      .changePassword(changePasswordInput)
      .then((result: AxiosResponse) => {
        switch (result.status) {
          case 200:
          case 202:
            setNeedsTOTPToUpdatePassword(false);
            break;
          case 205:
            setNeedsTOTPToUpdatePassword(true);
            break;
          default:
            console.error(result);
        }

        if (result.status === 200 || result.status === 202) {
          return;
        }

        router.push('/login');
      })
      .catch((err: AxiosError) => {
        console.error(err);
      });
  };

  return (
    <AppLayout title="User Settings">
      <Container size="sm">
        <Title order={3} my="md">
          <Center>User Settings</Center>
        </Title>

        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <Title order={5}>Upload Avatar</Title>
              <Divider mb="md" />
              <Dropzone
                onDrop={async (files: File[]) => {
                  await apiClient
                    .uploadNewAvatar(new AvatarUpdateInput({ base64EncodedData: await toBase64(files[0]) }))
                    .then((res) => {
                      console.dir(res);
                    });
                }}
                onReject={() => console.error('rejected files')}
                maxFiles={1}
                multiple={false}
                maxSize={3 * 1024 ** 2}
                accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg, MIME_TYPES.gif]}
              >
                <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={50} stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={50} stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={50} stroke={1.5} />
                  </Dropzone.Idle>

                  <Center>
                    <Text size="xs" inline>
                      Drag an image here or click to select file
                    </Text>
                  </Center>
                </Group>
              </Dropzone>
              <Center>
                <Button mt="md">Upload</Button>
              </Center>
            </Grid.Col>
            <Grid.Col span={6}>
              <form onSubmit={changePasswordForm.onSubmit(changePassword)}>
                <Title order={5}>Change Password</Title>
                <Divider />
                <TextInput
                  label="Current Password"
                  type="password"
                  {...changePasswordForm.getInputProps('currentPassword')}
                />
                <TextInput label="New Password" type="password" {...changePasswordForm.getInputProps('newPassword')} />
                <TextInput
                  label="Confirm New Password"
                  type="password"
                  {...changePasswordForm.getInputProps('newPasswordConfirmation')}
                />
                {needsTOTPToUpdatePassword && <TextInput label="TOTP Token" type="password" />}
                <Center>
                  <Button mt="xl" type="submit">
                    Change Password
                  </Button>
                </Center>
              </form>
            </Grid.Col>
          </Grid>

          {!user.emailAddressVerifiedAt && (
            <Center>
              <Button disabled={verificationRequested} onClick={requestVerificationEmail}>
                Verify my Email
              </Button>
            </Center>
          )}

          {configuredSettings.length > 0 && (
            <Paper shadow="xs" p="md">
              <Text size="md">Configured Settings</Text>
              <Table mt="md" striped highlightOnHover withBorder withColumnBorders>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Configured Value</th>
                    <th>Default Value</th>
                    <th>Possible Values</th>
                    <th>Created At</th>
                    <th>Last Updated At</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {configuredSettings.map((settingConfig: ServiceSettingConfiguration) => (
                    <tr key={settingConfig.id} style={{ cursor: 'pointer' }}>
                      <td>{settingConfig.serviceSetting.name}</td>
                      <td>
                        {(settingConfig.serviceSetting.enumeration.length > 0 && (
                          <Select
                            onChange={async (item: string) => {
                              console.log(item);
                            }}
                            value={settingConfig.value}
                            data={settingConfig.serviceSetting.enumeration}
                          />
                        )) || <TextInput label="Value" value={settingConfig.value} />}
                      </td>
                      <td>{settingConfig.serviceSetting.defaultValue}</td>
                      <td>{settingConfig.serviceSetting.enumeration.join(', ')}</td>
                      <td>{formatDate(settingConfig.createdAt)}</td>
                      <td>{formatDate(settingConfig.lastUpdatedAt)}</td>
                      <td>
                        <Button disabled={true}>Save</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          )}

          {(availableSettings.length > 0 || configuredSettings.length > 0) && <Divider my="xl" />}

          {availableSettings.length > 0 && (
            <Paper shadow="xs" p="xs">
              <Text size="md">Available Settings</Text>

              <Table mt="md" striped highlightOnHover withBorder withColumnBorders>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Value</th>
                    <th>Default Value</th>
                    <th>Possible Values</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {availableSettings.map((serviceSetting: ServiceSetting) => (
                    <tr key={serviceSetting.id} style={{ cursor: 'pointer' }}>
                      <td>{serviceSetting.name}</td>
                      <td>{serviceSetting.description}</td>
                      <td>
                        {(serviceSetting.enumeration.length > 0 && (
                          <Select
                            onChange={async (item: string) => {
                              console.log(item);
                            }}
                            value={''}
                            data={serviceSetting.enumeration}
                          />
                        )) || <TextInput value={''} />}
                      </td>
                      <td>{serviceSetting.defaultValue}</td>
                      <td>{serviceSetting.enumeration.join(', ')}</td>
                      <td>
                        <Button disabled={true}>Assign</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          )}

          {pendingInvites.length > 0 && (
            <>
              <List>{pendingInvites}</List>
              <Divider my="lg" />
            </>
          )}
        </Stack>
      </Container>
    </AppLayout>
  );
}
