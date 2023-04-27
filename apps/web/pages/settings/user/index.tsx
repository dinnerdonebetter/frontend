import { Button, Center, Container, Divider, Grid, List, Paper, Select, TextInput, Title } from '@mantine/core';
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

declare interface HouseholdSettingsPageProps {
  user: User;
  invitations: HouseholdInvitation[];
  allSettings: ServiceSetting[];
  userSettings: ServiceSettingConfiguration[];
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
      userSettings: rawUserSettings.data || [],
      allSettings: allSettings.data || [],
    },
  };
};

export default function UserSettingsPage({
  user,
  invitations,
  allSettings,
  userSettings,
}: HouseholdSettingsPageProps): JSX.Element {
  const pendingInvites = (invitations || []).map((invite: HouseholdInvitation) => {
    return (
      <List.Item key={invite.id}>
        {invite.toEmail} - {invite.status}
      </List.Item>
    );
  });

  const settingsToDisplay = allSettings.filter((setting: ServiceSetting) => {
    return !userSettings.find((userSetting: ServiceSettingConfiguration) => {
      return userSetting.serviceSetting.id === setting.id;
    });
  });

  return (
    <AppLayout title="User Settings">
      <Container size="xs">
        <Title order={3} my="md">
          <Center>User Settings</Center>
        </Title>

        {settingsToDisplay.length > 0 && (
          <Paper shadow="xs" p="md">
            {settingsToDisplay.map((setting: ServiceSetting) => {
              return <div key={setting.id}>{setting.name}</div>;
            })}
          </Paper>
        )}

        <Paper shadow="xs" p="md">
          {userSettings.map((setting: ServiceSettingConfiguration) => {
            return (
              <Grid>
                <Grid.Col span="auto">
                  <TextInput label="Setting" value={setting.serviceSetting.name} disabled />
                </Grid.Col>
                <Grid.Col span="auto">
                  {(setting.serviceSetting.enumeration.length > 0 && (
                    <Select
                      label="Value"
                      onChange={async (item: string) => {
                        console.log(item);
                      }}
                      value={setting.value}
                      data={setting.serviceSetting.enumeration}
                    />
                  )) || <TextInput label="Value" value={setting.value} />}
                </Grid.Col>
                <Grid.Col span="auto">
                  <TextInput label="Default Value" value={setting.serviceSetting.defaultValue} disabled />
                </Grid.Col>
                <Grid.Col span="auto" mt="xl">
                  <Button disabled={true}>Save</Button>
                </Grid.Col>
              </Grid>
            );
          })}
        </Paper>

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
