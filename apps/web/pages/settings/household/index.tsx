import { AxiosError, AxiosResponse } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  List,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useState } from 'react';
import { z } from 'zod';

import {
  Household,
  HouseholdInvitation,
  HouseholdInvitationCreationRequestInput,
  HouseholdUpdateRequestInput,
  HouseholdUserMembershipWithUser,
  IAPIError,
  QueryFilteredResult,
  ServiceSettingConfiguration,
  User,
} from '@dinnerdonebetter/models';

import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';
import { IconAlertCircle } from '@tabler/icons';

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
  emailAddress: z.string().trim().email({ message: 'Invalid email' }).trim(),
  toName: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

const householdUpdateSchema = z.object({
  name: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().regex(/\d{5}/, 'token must be 6 digits').trim().optional(),
});

const allStates = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

export default function HouseholdSettingsPage(props: HouseholdSettingsPageProps): JSX.Element {
  const { user, invitations } = props;

  const [household, setHousehold] = useState<Household>(props.household);
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

  const householdUpdateForm = useForm({
    initialValues: {
      name: household.name,
      contactPhone: household.contactPhone,
      addressLine1: household.addressLine1,
      addressLine2: household.addressLine2,
      city: household.city,
      state: household.state,
      zipCode: household.zipCode,
      country: 'USA',
    },
    validate: zodResolver(householdUpdateSchema),
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

  const householdDataHasChanged = (): boolean => {
    return (
      household.name !== householdUpdateForm.values.name ||
      household.contactPhone !== householdUpdateForm.values.contactPhone ||
      household.addressLine1 !== householdUpdateForm.values.addressLine1 ||
      household.addressLine2 !== householdUpdateForm.values.addressLine2 ||
      household.city !== householdUpdateForm.values.city ||
      household.state !== householdUpdateForm.values.state ||
      household.zipCode !== householdUpdateForm.values.zipCode ||
      household.country !== householdUpdateForm.values.country
    );
  };

  const updateHousehold = async () => {
    const validation = householdUpdateForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const updateInput = new HouseholdUpdateRequestInput({
      name: householdUpdateForm.values.name,
      contactPhone: householdUpdateForm.values.contactPhone,
      addressLine1: householdUpdateForm.values.addressLine1,
      addressLine2: householdUpdateForm.values.addressLine2,
      city: householdUpdateForm.values.city,
      state: householdUpdateForm.values.state,
      zipCode: householdUpdateForm.values.zipCode,
      country: householdUpdateForm.values.country,
    });

    const apiClient = buildLocalClient();

    await apiClient
      .updateHousehold(household.id, updateInput)
      .then((_: AxiosResponse<Household>) => {
        setHousehold(household);
        householdUpdateForm.reset();
      })
      .catch((err: AxiosError<IAPIError>) => {
        setInvitationSubmissionError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout title="Household Settings">
      <Container size="xs">
        <Center>
          <Title order={2}>Household Settings</Title>
        </Center>

        <Box my="xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateHousehold();
            }}
          >
            <Stack>
              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                We don&apos;t require you to fill this info out to use the service, but future experiments involving
                features like grocery delivery may require this information.
              </Alert>

              <TextInput
                label="Name"
                placeholder=""
                disabled={!user.emailAddressVerifiedAt}
                {...householdUpdateForm.getInputProps('name')}
              />
              <Grid>
                <Grid.Col span={7}>
                  <TextInput
                    label="Address Line 1"
                    placeholder=""
                    disabled={!user.emailAddressVerifiedAt}
                    {...householdUpdateForm.getInputProps('addressLine1')}
                  />
                </Grid.Col>
                <Grid.Col span={5}>
                  <TextInput
                    label="Address Line 2"
                    placeholder=""
                    disabled={!user.emailAddressVerifiedAt}
                    {...householdUpdateForm.getInputProps('addressLine2')}
                  />
                </Grid.Col>
              </Grid>
              <Grid>
                <Grid.Col span={7}>
                  <TextInput
                    label="City"
                    placeholder=""
                    disabled={!user.emailAddressVerifiedAt}
                    {...householdUpdateForm.getInputProps('city')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <Select
                    label="State"
                    searchable
                    placeholder=""
                    disabled={!user.emailAddressVerifiedAt}
                    value={householdUpdateForm.getInputProps('state').value}
                    data={allStates.map((state) => {
                      return { value: state, label: state };
                    })}
                    onChange={(e) => {
                      householdUpdateForm.getInputProps('state').onChange(e);
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <TextInput
                    label="Zip Code"
                    placeholder=""
                    disabled={!user.emailAddressVerifiedAt}
                    {...householdUpdateForm.getInputProps('zipCode')}
                  />
                </Grid.Col>
              </Grid>
              <Button
                type="submit"
                disabled={!householdUpdateForm.isValid() || !user.emailAddressVerifiedAt || !householdDataHasChanged()}
                fullWidth
              >
                Update
              </Button>
            </Stack>
          </form>
        </Box>

        {members.length > 0 && (
          <>
            <Divider my="lg" label="Members" labelPosition="center" />
            <SimpleGrid cols={1}>{members}</SimpleGrid>
          </>
        )}

        {outboundPendingInvites.length > 0 && (
          <>
            <Divider my="lg" label="Awaiting Invites" labelPosition="center" />
            <List>{outboundPendingInvites}</List>
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

        <Title order={3} mt="xl">
          Send invite
        </Title>

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
                placeholder="Join my household on Dinner Done Better!"
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
