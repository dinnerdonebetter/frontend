import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { Alert, TextInput, PasswordInput, Button, Group, Space } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

import { ServiceError, UserRegistrationInput, UserRegistrationResponse } from 'models';
import { buildBrowserSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';

export default function Register() {
  const router = useRouter();

  const [registrationError, setRegistrationError] = useState('');

  const form = useForm({
    initialValues: {
      emailAddress: '',
      username: '',
      password: '',
      repeatedPassword: '',
      birthMonth: undefined,
      birthDay: undefined,
    },

    validate: {
      emailAddress: (value) => (value.trim() === '' ? 'email address cannot be empty' : null),
      username: (value) => (value.trim() === '' ? 'username cannot be empty' : null),
      password: (value) => {
        if (value.trim() === '') {
          return 'password cannot be empty';
        }

        if (value.trim() !== form.values.repeatedPassword) {
          return 'passwords must match';
        }

        return null;
      },
      repeatedPassword: (value) => {
        if (value.trim() === '') {
          return 'repeated password cannot be empty';
        }

        if (value.trim() !== form.values.password) {
          return 'passwords must match';
        }

        return null;
      },
    },
  });

  const register = async () => {
    const registrationInput = new UserRegistrationInput({
      emailAddress: form.values.emailAddress,
      username: form.values.username,
      password: form.values.password,
      birthMonth: form.values.birthMonth ? parseInt(form.values.birthMonth!) : undefined,
      birthDay: form.values.birthDay ? parseInt(form.values.birthDay!) : undefined,
    });

    console.log(JSON.stringify(registrationInput));

    const pfClient = buildBrowserSideClient();

    await pfClient
      .register(registrationInput)
      .then((_: AxiosResponse<UserRegistrationResponse>) => {
        router.push('/login');
      })
      .catch((err: AxiosError<ServiceError>) => {
        setRegistrationError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout>
      <form onSubmit={form.onSubmit(register)}>
        <TextInput label="Email Address" placeholder="cool_person@email.site" {...form.getInputProps('emailAddress')} />
        <TextInput label="Username" placeholder="username" {...form.getInputProps('username')} />
        <PasswordInput label="Password" placeholder="hunter2" {...form.getInputProps('password')} />
        <PasswordInput label="Password (again)" placeholder="hunter2" {...form.getInputProps('repeatedPassword')} />

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
          <Button type="submit" mt="sm">
            Login
          </Button>
        </Group>
      </form>
    </AppLayout>
  );
}
