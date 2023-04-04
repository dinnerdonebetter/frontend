import { AxiosError, AxiosResponse } from 'axios';
import { Grid, Button, Stack, Space } from '@mantine/core';
import { useRouter } from 'next/router';

import { APIError, HouseholdInvitation, HouseholdInvitationUpdateRequestInput } from '@prixfixeco/models';

import { buildBrowserSideClient, buildServerSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { serverSideTracer } from '../src/tracer';
import { extractUserInfoFromCookie } from '../src/auth';

declare interface AcceptInvitationPageProps {
  invitationToken: string;
  invitationID: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<AcceptInvitationPageProps>> => {
  const span = serverSideTracer.startSpan('RegistrationPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const invitationToken = context.query['t']?.toString() || '';
  const invitationID = context.query['i']?.toString() || '';

  let props: GetServerSidePropsResult<AcceptInvitationPageProps> = {
    props: {
      invitationID: invitationID,
      invitationToken: invitationToken,
    },
  };

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (!userSessionData?.userID) {
    console.log('returning props');
    return {
      redirect: {
        destination: `/register?i=${invitationID}&t=${invitationToken}`,
        permanent: false,
      },
    };
  }

  span.end();

  return props;
};

function AcceptInvitationPage(props: AcceptInvitationPageProps) {
  const { invitationID, invitationToken } = props;
  const router = useRouter();
  const pfClient = buildBrowserSideClient();

  const acceptInvite = async () => {
    const proceed = confirm('Are you sure you want to accept this invite?');
    if (proceed) {
      await pfClient
        .acceptInvitation(
          invitationID,
          new HouseholdInvitationUpdateRequestInput({
            token: invitationToken,
          }),
        )
        .then(() => {
          router.push('/');
        })
        .catch((_: AxiosError<APIError>) => {
          window.location.href = `/register?i=${invitationID}&t=${invitationToken}`;
        });
    }
  };

  const rejectInvite = async () => {
    const proceed = confirm('Are you sure you want to reject this invite?');
    if (proceed) {
      await pfClient
        .rejectInvitation(
          invitationID,
          new HouseholdInvitationUpdateRequestInput({
            token: invitationToken,
          }),
        )
        .finally(() => {
          router.push('/');
        });
    }
  };

  return (
    <AppLayout title="Meal Plan">
      <Grid mt="xl">
        <Grid.Col span={4}>
          <Space h="xl" />
        </Grid.Col>
        <Grid.Col span="auto">
          <Stack>
            <Button onClick={acceptInvite}>Accept Invite</Button>
            <Button onClick={rejectInvite}>Reject Invite</Button>
          </Stack>
        </Grid.Col>
        <Grid.Col span={4}>
          <Space h="xl" />
        </Grid.Col>
      </Grid>
    </AppLayout>
  );
}

export default AcceptInvitationPage;
