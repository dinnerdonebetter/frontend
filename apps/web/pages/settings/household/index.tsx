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
  Textarea,
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
  IAPIError,
  QueryFilteredResult,
  ServiceSettingConfiguration,
  User,
} from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { useState } from 'react';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';

declare interface HouseholdSettingsPageProps {
  household: Household;
  user: User;
  invitations: HouseholdInvitation[];
  householdSettings: ServiceSettingConfiguration[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<HouseholdSettingsPageProps>> => {
  const span = serverSideTracer.startSpan('HouseholdSettingsPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'HOUSEHOLD_SETTINGS_PAGE', context, {
      householdID: userSessionData.householdID,
    });
  }

  const userPromise = apiClient.self().then((result: AxiosResponse<User>) => {
    span.addEvent('user retrieved');
    return result.data;
  });

  const householdPromise = apiClient.getCurrentHouseholdInfo().then((result: AxiosResponse<Household>) => {
    span.addEvent('household retrieved');
    return result.data;
  });

  const invitationsPromise = apiClient
    .getSentInvites()
    .then((result: AxiosResponse<QueryFilteredResult<HouseholdInvitation>>) => {
      span.addEvent('invitations retrieved');
      return result.data;
    });

  const rawHouseholdSettingsPromise = apiClient
    .getServiceSettingConfigurationsForHousehold()
    .then((result: AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>) => {
      span.addEvent('service settings retrieved');
      return result.data;
    });

  let notFound = false;
  let notAuthorized = false;
  const retrievedData = await Promise.all([
    userPromise,
    householdPromise,
    invitationsPromise,
    rawHouseholdSettingsPromise,
  ]).catch((error: AxiosError) => {
    if (error.response?.status === 404) {
      notFound = true;
    } else if (error.response?.status === 401) {
      notAuthorized = true;
    } else {
      console.error(`${error.response?.status} ${error.response?.config?.url}}`);
    }
  });

  if (notFound || !retrievedData) {
    return {
      redirect: {
        destination: '/meal_plans',
        permanent: false,
      },
    };
  }

  if (notAuthorized) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const [user, household, invitations, rawHouseholdSettings] = retrievedData;

  span.end();
  return {
    props: { user, household, invitations: invitations.data, householdSettings: rawHouseholdSettings.data || [] },
  };
};

const inviteFormSchema = z.object({
  emailAddress: z.string().email({ message: 'Invalid email' }).trim(),
  toName: z.string().optional(),
  note: z.string().optional(),
});

export default function HouseholdSettingsPage(props: HouseholdSettingsPageProps): JSX.Element {
  const { user, household, invitations } = props;
  const [invitationSubmissionError, setInvitationSubmissionError] = useState('');

  const members = (household.members || []).map((member: HouseholdUserMembershipWithUser) => {
    return (
      <Card withBorder style={{ width: '100%' }} key={member.id}>
        <Grid>
          <Grid.Col span="content">
            {member.belongsToUser?.avatar && <Avatar component="a" src={member.belongsToUser.avatar} alt="it's me" />}

            {!member.belongsToUser?.avatar && <Avatar src={null} alt="no image here" />}
          </Grid.Col>
          <Grid.Col span="auto">
            <Text mt={7}>{member.belongsToUser?.firstName ?? member.belongsToUser?.username}</Text>
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
      toName: '',
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

    const apiClient = buildLocalClient();

    await apiClient
      .inviteUserToHousehold(household.id, householdInvitationInput)
      .then((_: AxiosResponse<HouseholdInvitation>) => {
        inviteForm.reset();
      })
      .catch((err: AxiosError<IAPIError>) => {
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
            <Grid.Col md={12} lg="auto">
              <TextInput
                label="Email Address"
                disabled={!user.emailAddressVerifiedAt}
                placeholder="neato_person@fake.email"
                {...inviteForm.getInputProps('emailAddress')}
              />
            </Grid.Col>
            <Grid.Col md={12} lg="auto">
              <TextInput
                label="Name"
                placeholder=""
                disabled={!user.emailAddressVerifiedAt}
                {...inviteForm.getInputProps('toName')}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col md={12} lg="auto">
              <Textarea
                label="Note"
                disabled={!user.emailAddressVerifiedAt}
                placeholder="Join my household on PrixFixe!"
                {...inviteForm.getInputProps('note')}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col md={12} lg={12}>
              <Button type="submit" disabled={!inviteForm.isValid() || !user.emailAddressVerifiedAt} fullWidth>
                Send Invite
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
