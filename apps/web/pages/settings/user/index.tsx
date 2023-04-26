import { Container, Divider, List, Title } from '@mantine/core';
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

  const rawUserSettingsPromise = apiClient
    .getServiceSettingConfigurationsForUser()
    .then((result: AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>) => {
      span.addEvent('service settings retrieved');
      return result.data;
    });

  const [user, invitations, rawUserSettings] = await Promise.all([
    userPromise,
    invitationsPromise,
    rawUserSettingsPromise,
  ]);

  span.end();
  return { props: { user, invitations: invitations.data, userSettings: rawUserSettings.data || [] } };
};

export default function UserSettingsPage({ user, invitations }: HouseholdSettingsPageProps): JSX.Element {
  const pendingInvites = (invitations || []).map((invite: HouseholdInvitation) => {
    return (
      <List.Item key={invite.id}>
        {invite.toEmail} - {invite.status}
      </List.Item>
    );
  });

  return (
    <AppLayout title="User Settings">
      <Container size="xs">
        <Title order={3}>{user.username}</Title>

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
