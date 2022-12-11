import { Container, Divider, List, Title } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { User, HouseholdInvitation, QueryFilteredResult } from '@prixfixeco/models';

import { buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { serverSideTracer } from '../../../src/tracer';

declare interface HouseholdSettingsPageProps {
  user: User;
  invitations: HouseholdInvitation[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<HouseholdSettingsPageProps>> => {
  const span = serverSideTracer.startSpan('UserSettingsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { data: user } = await pfClient.self().then((result: AxiosResponse<User>) => {
    span.addEvent('user info retrieved');
    return result;
  });

  const { data: invitations } = await pfClient
    .getReceivedInvites()
    .then((result: AxiosResponse<QueryFilteredResult<HouseholdInvitation>>) => {
      span.addEvent('invitations retrieved');
      return result;
    });

  span.end();
  return { props: { user, invitations: invitations.data } };
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
