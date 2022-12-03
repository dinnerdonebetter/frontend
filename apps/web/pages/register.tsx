import { useState } from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Alert, TextInput, PasswordInput, Button, Group, Space, Grid, Text, Container, Divider } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

import { ServiceError, UserRegistrationInput } from '@prixfixeco/models';

import { buildBrowserSideClient } from '../lib/client';
import { AppLayout } from '../lib/layouts';
import Link from 'next/link';
import { formatISO, subYears } from 'date-fns';

const registrationFormSchema = z.object({
  emailAddress: z.string().email({ message: 'invalid email' }).trim(),
  householdName: z.string().trim(),
  username: z.string().min(1, 'username is required').trim(),
  password: z.string().min(8, 'password must have at least 8 characters').trim(),
  repeatedPassword: z.string().min(8, 'repeated password must have at least 8 characters').trim(),
  birthday: z.date().nullable(),
});

export default function Register(): JSX.Element {
  const router = useRouter();

  const [registrationError, setRegistrationError] = useState('');

  const registrationForm = useForm({
    initialValues: {
      emailAddress: '',
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
    });

    if (registrationForm.values.birthday) {
      registrationInput.birthday = formatISO(registrationForm.values.birthday);
    }

    await buildBrowserSideClient()
      .register(registrationInput)
      .then(() => {
        router.push('/login');
      })
      .catch((err: AxiosError<ServiceError>) => {
        setRegistrationError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout title="register">
      <Container size="xs">
        <form onSubmit={registrationForm.onSubmit(register)}>
          <TextInput
            label="Email Address"
            required
            placeholder="cool_person@emailprovider.website"
            {...registrationForm.getInputProps('emailAddress')}
          />
          <TextInput label="Username" required placeholder="username" {...registrationForm.getInputProps('username')} />
          <PasswordInput
            label="Password"
            required
            placeholder="hunter2"
            {...registrationForm.getInputProps('password')}
          />
          <PasswordInput
            label="Password (again)"
            placeholder="hunter2"
            required
            {...registrationForm.getInputProps('repeatedPassword')}
          />

          <Divider label="optional fields" labelPosition="center" m="sm" />

          <TextInput
            label="Household Name"
            placeholder="username's Beloved Family"
            {...registrationForm.getInputProps('householdName')}
          />

          <DatePicker
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
            <Button type="submit" mt="lg" fullWidth>
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
