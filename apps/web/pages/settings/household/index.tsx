import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  List,
  SimpleGrid,
  Space,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

import {
  Household,
  HouseholdInvitation,
  HouseholdInvitationCreationRequestInput,
  HouseholdUserMembershipWithUser,
  ServiceError,
} from '@prixfixeco/models';

import { buildBrowserSideClient, buildServerSideClient } from '../../../lib/client';
import { AppLayout } from '../../../lib/layouts';
import { useState } from 'react';
import { serverSideTracer } from '../../../lib/tracer';

declare interface HouseholdSettingsPageProps {
  household: Household;
  invitations: HouseholdInvitation[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<HouseholdSettingsPageProps>> => {
  const span = serverSideTracer.startSpan('HouseholdSettingsPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { data: household } = await pfClient.getCurrentHouseholdInfo().then((result) => {
    span.addEvent('household retrieved');
    return result;
  });

  const { data: invitations } = await pfClient.getSentInvites().then((result) => {
    span.addEvent('invitations retrieved');
    return result;
  });

  span.end();
  return { props: { household, invitations: invitations.data } };
};

const inviteFormSchema = z.object({
  emailAddress: z.string().email({ message: 'Invalid email' }),
  note: z.string().optional(),
});

export default function HouseholdSettingsPage(props: HouseholdSettingsPageProps): JSX.Element {
  const { household, invitations } = props;
  const [invitationSubmissionError, setInvitationSubmissionError] = useState('');

  const members = (household.members || []).map((member: HouseholdUserMembershipWithUser) => {
    return (
      <Card withBorder style={{ width: '100%' }} key={member.id}>
        <Grid>
          <Grid.Col span="content">
            {member.belongsToUser.avatar && <Avatar component="a" src={member.belongsToUser.avatar} alt="it's me" />}

            {!member.belongsToUser.avatar && <Avatar src={null} alt="no image here" />}
          </Grid.Col>
          <Grid.Col span="auto">
            <Text mt={7}>{member.belongsToUser.username}</Text>
          </Grid.Col>
        </Grid>
      </Card>
    );
  });

  const outboundPendingInvites = (invitations || []).map((invite: HouseholdInvitation) => {
    return (
      <List.Item key={invite.id}>
        {invite.toEmail} - {invite.status}
      </List.Item>
    );
  });

  const inviteForm = useForm({
    initialValues: {
      emailAddress: '',
      note: '',
    },
    validate: zodResolver(inviteFormSchema),
  });

  const submitInvite = async () => {
    setInvitationSubmissionError('');
    const validation = inviteForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const householdInvitationInput = new HouseholdInvitationCreationRequestInput({
      toEmail: inviteForm.values.emailAddress,
      note: inviteForm.values.note,
    });

    const pfClient = buildBrowserSideClient();

    await pfClient
      .inviteUserToHousehold(household.id, householdInvitationInput)
      .then((_: AxiosResponse<HouseholdInvitation>) => {
        inviteForm.reset();
      })
      .catch((err: AxiosError<ServiceError>) => {
        setInvitationSubmissionError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout title="Household Settings">
      <Container size="xs">
        <Title order={3}>{household.name}</Title>

        {members.length > 0 && (
          <>
            <SimpleGrid cols={1}>{members}</SimpleGrid>
            <Divider my="lg" />
          </>
        )}

        {outboundPendingInvites.length > 0 && (
          <>
            <List>{outboundPendingInvites}</List>
            <Divider my="lg" />
          </>
        )}

        {invitationSubmissionError && (
          <>
            <Space h="md" />
            <Alert title="Oh no!" color="tomato">
              {invitationSubmissionError}
            </Alert>
          </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitInvite();
          }}
        >
          <Grid>
            <Grid.Col md={12} lg={6}>
              <TextInput
                label="Email Address"
                placeholder="cool@person.com"
                {...inviteForm.getInputProps('emailAddress')}
              />
            </Grid.Col>
            <Grid.Col md={12} lg={6}>
              <TextInput label="Note" placeholder="" {...inviteForm.getInputProps('note')} />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col md={12} lg={12}>
              <Button type="submit" disabled={!inviteForm.isValid()} fullWidth>
                Send Invite
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
