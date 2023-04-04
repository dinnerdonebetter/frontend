import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { Alert, TextInput, PasswordInput, Button, Group, Space, Grid, Text, Container, Divider } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

import { HouseholdInvitation, IAPIError, UserRegistrationInput } from '@prixfixeco/models';

import { buildBrowserSideClient, buildServerSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';
import Link from 'next/link';
import { formatISO, subYears } from 'date-fns';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { serverSideTracer } from '../src/tracer';

const registrationFormSchema = z.object({
  emailAddress: z.string().email({ message: 'invalid email' }).trim(),
  householdName: z.string().trim(),
  username: z.string().min(1, 'username is required').trim(),
  password: z.string().min(8, 'password must have at least 8 characters').trim(),
  repeatedPassword: z.string().min(8, 'repeated password must have at least 8 characters').trim(),
  birthday: z.date().nullable(),
});

declare interface RegistrationPageProps {
  invitationToken?: string;
  invitationID?: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RegistrationPageProps>> => {
  const span = serverSideTracer.startSpan('RegistrationPage.getServerSideProps');

  const invitationToken = context.query['t']?.toString() || '';
  const invitationID = context.query['i']?.toString() || '';

  let props: GetServerSidePropsResult<RegistrationPageProps> = {
    props: {
      invitationID: invitationID,
      invitationToken: invitationToken,
    },
  };

  span.end();

  return props;
};

export default function Register(props: RegistrationPageProps): JSX.Element {
  const { invitation } = props;

  const router = useRouter();
  const [registrationError, setRegistrationError] = useState('');

  const registrationForm = useForm({
    initialValues: {
      emailAddress: invitation?.toEmail || '',
      username: '',
      password: '',
      householdName: '',
      repeatedPassword: '',
      birthday: null,
    },

    validate: zodResolver(registrationFormSchema),
  });

  const register = async () => {
    const validation = registrationForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (registrationForm.values.password !== registrationForm.values.repeatedPassword) {
      registrationForm.setFieldError('password', 'passwords do not match');
      registrationForm.setFieldError('repeatedPassword', 'passwords do not match');
      return;
    }

    const registrationInput = new UserRegistrationInput({
      emailAddress: registrationForm.values.emailAddress,
      username: registrationForm.values.username,
      password: registrationForm.values.password,
      householdName: registrationForm.values.householdName,
      invitationToken: invitation?.token,
      invitationID: invitation?.id,
    });

    if (registrationForm.values.birthday) {
      registrationInput.birthday = formatISO(registrationForm.values.birthday);
    }

    await buildBrowserSideClient()
      .register(registrationInput)
      .then(() => {
        router.push('/login');
      })
      .catch((err: AxiosError<IAPIError>) => {
        setRegistrationError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout title="register">
      <Container size="xs">
        <form onSubmit={registrationForm.onSubmit(register)}>
          <TextInput
            data-pf="registration-email-address-input"
            label="Email Address"
            required
            disabled={invitation?.toEmail}
            placeholder="cool_person@emailprovider.website"
            {...registrationForm.getInputProps('emailAddress')}
          />
          <TextInput
            data-pf="registration-username-input"
            label="Username"
            required
            placeholder="username"
            {...registrationForm.getInputProps('username')}
          />
          <PasswordInput
            data-pf="registration-password-input"
            label="Password"
            required
            placeholder="hunter2"
            {...registrationForm.getInputProps('password')}
          />
          <PasswordInput
            data-pf="registration-password-confirm-input"
            label="Password (again)"
            placeholder="hunter2"
            required
            {...registrationForm.getInputProps('repeatedPassword')}
          />

          <Divider label="optional fields" labelPosition="center" m="sm" />

          {!invitation?.toEmail && (
            <TextInput
              data-pf="registration-household-name-input"
              label="Household Name"
              placeholder="username's Beloved Family"
              {...registrationForm.getInputProps('householdName')}
            />
          )}

          <DatePicker
            data-pf="registration-birthday-input"
            placeholder="optional :)"
            initialLevel="date"
            label="Birthday"
            dropdownType="popover"
            dropdownPosition="bottom-start"
            initialMonth={subYears(new Date(), 13)} // new Date('1970-01-02')
            maxDate={subYears(new Date(), 13)} // COPPA
            {...registrationForm.getInputProps('birthday')}
          />

          {registrationError && (
            <>
              <Space h="md" />
              <Alert title="Oh no!" color="tomato">
                {registrationError}
              </Alert>
            </>
          )}

          <Group position="center">
            <Button data-pf="registration-button" type="submit" mt="lg" fullWidth>
              Register
            </Button>
          </Group>

          <Grid justify="space-between" mt={2}>
            <Grid.Col span={3}>
              <Text size="xs" align="left">
                <Link href="/passwords/forgotten">Forgot password?</Link>
              </Text>
            </Grid.Col>
            <Grid.Col span={3}>
              <Text size="xs" align="right">
                <Link href="/login">Login instead</Link>
              </Text>
            </Grid.Col>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
