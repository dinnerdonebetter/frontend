import {
  Button,
  Center,
  Container,
  Divider,
  Text,
  List,
  Paper,
  Select,
  Space,
  Table,
  TextInput,
  Title,
} from '@mantine/core';
import { AxiosResponse } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import {
  User,
  HouseholdInvitation,
  QueryFilteredResult,
  ServiceSetting,
  ServiceSettingConfiguration,
} from '@prixfixeco/models';

import { buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';
import { formatRelative } from 'date-fns';

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

export default function UserSettingsPage({
  user,
  invitations,
  allSettings,
  configuredSettings,
}: HouseholdSettingsPageProps): JSX.Element {
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

  const formatDate = (x: string | undefined): string => {
    return x ? formatRelative(new Date(x), new Date()) : 'never';
  };

  return (
    <AppLayout title="User Settings">
      <Container size="xl">
        <Title order={3} my="md">
          <Center>User Settings</Center>
        </Title>

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
      </Container>
    </AppLayout>
  );
}
