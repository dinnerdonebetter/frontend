import { useState } from 'react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Alert, TextInput, PasswordInput, Button, Group, Space, Grid, Text, Container } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

import { ServiceError, UserRegistrationInput } from '@prixfixeco/models';

import { buildBrowserSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';
import Link from 'next/link';

const registrationFormSchema = z.object({
  emailAddress: z.string().email({ message: 'invalid email' }),
  username: z.string().min(1, 'username is required'),
  password: z.string().min(8, 'password must have at least 8 characters'),
  repeatedPassword: z.string().min(8, 'repeated password must have at least 8 characters'),
});

export default function Register(): JSX.Element {
  const router = useRouter();

  const [registrationError, setRegistrationError] = useState('');

  const registrationForm = useForm({
    initialValues: {
      emailAddress: '',
      username: '',
      password: '',
      repeatedPassword: '',
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
    });

    const pfClient = buildBrowserSideClient();

    await pfClient
      .register(registrationInput)
      .then(() => {
        router.push('/login');
      })
      .catch((err: AxiosError<ServiceError>) => {
        setRegistrationError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout>
      <Container size="xs">
        <form onSubmit={registrationForm.onSubmit(register)}>
          <TextInput
            label="Email Address"
            placeholder="cool_person@email.site"
            {...registrationForm.getInputProps('emailAddress')}
          />
          <TextInput label="Username" placeholder="username" {...registrationForm.getInputProps('username')} />
          <PasswordInput label="Password" placeholder="hunter2" {...registrationForm.getInputProps('password')} />
          <PasswordInput
            label="Password (again)"
            placeholder="hunter2"
            {...registrationForm.getInputProps('repeatedPassword')}
          />

          <DatePicker placeholder="optional :)" initialLevel="year" label="Birth Date" maxDate={new Date()} />

          {registrationError && (
            <>
              <Space h="md" />
              <Alert title="Oh no!" color="red">
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
