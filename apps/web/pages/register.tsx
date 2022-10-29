import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { Alert, TextInput, PasswordInput, Button, Group, Space, NumberInput } from '@mantine/core';

import { ServiceError, UserRegistrationInput, UserRegistrationResponse } from 'models';
import { buildBrowserSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';

export default function Register() {
  const router = useRouter();

  const [registrationError, setLoginError] = useState('');

  const form = useForm({
    initialValues: {
      username: 'testing',
      password: 'Reversed123!@#',
      birthMonth: undefined,
    },

    validate: {
      username: (value) => (value.trim() === '' ? 'username cannot be empty' : null),
      birthMonth: (value) => ((value || -1) < 0 ? 'birth month cannot be empty' : null),
      password: (value) => (value.trim() === '' ? 'password cannot be empty' : null),
    },
  });

  const login = async () => {
    const loginInput = new UserRegistrationInput({
      username: form.values.username,
      password: form.values.password,
      birthMonth: form.values.birthMonth,
    });

    const pfClient = buildBrowserSideClient();

    await pfClient
      .plainRegister(loginInput)
      .then((_: AxiosResponse<UserRegistrationResponse>) => {
        router.push('/login');
      })
      .catch((err: AxiosError<ServiceError>) => {
        setLoginError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout>
      <form onSubmit={form.onSubmit(login)}>
        <TextInput label="Username" placeholder="username" {...form.getInputProps('username')} />
        <NumberInput min={1} max={12} label="Birth Month" {...form.getInputProps('birthMonth')} />
        <PasswordInput label="Password" placeholder="hunter2" {...form.getInputProps('password')} />

        {registrationError && (
          <>
            <Space h="md" />
            <Alert title="Bummer!" color="red">
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
