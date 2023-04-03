import { AxiosError } from 'axios';
import { Grid, Button, Stack, Space } from '@mantine/core';
import { useRouter } from 'next/router';

import { APIError, HouseholdInvitationUpdateRequestInput } from '@prixfixeco/models';

import { buildBrowserSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';

/*
https://www.prixfixe.dev/accept_invitation?i=cgk80ta23akg00eo8pf0&t=DHriGX_38me7f7NY7yjHjrh47jU9RIbloCAQU4SJhRwDoHSI23dw0kaD2CBHepRnnpbmHxcPOohCC5t8foniGA

localhost:9000/accept_invitation?i=cgk80ta23akg00eo8pf0&t=DHriGX_38me7f7NY7yjHjrh47jU9RIbloCAQU4SJhRwDoHSI23dw0kaD2CBHepRnnpbmHxcPOohCC5t8foniGA
*/

declare interface AcceptInvitationPageProps {
  //
}

function AcceptInvitationPage({}: AcceptInvitationPageProps) {
  const router = useRouter();
  const pfClient = buildBrowserSideClient();

  const acceptInvite = async () => {
    const proceed = confirm('Are you sure you want to accept this invite?');
    if (proceed) {
      const sp = new URLSearchParams(window.location.search);
      const invitationID = sp.get('i') || '';
      const invitationToken = sp.get('t') || '';
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
      const sp = new URLSearchParams(window.location.search);
      const invitationID = sp.get('i') || '';
      const invitationToken = sp.get('t') || '';
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
