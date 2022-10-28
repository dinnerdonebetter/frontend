import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { Container, Alert, TextInput, PasswordInput, Button, Group, Space } from '@mantine/core';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';
import { buildBrowserSideClient } from '../src/client';

export default function Login() {
  const router = useRouter();

  const [needsTOTPToken, setNeedsTOTPToken] = useState(false);
  const [loginError, setLoginError] = useState('');

  const form = useForm({
    initialValues: {
      username: 'testing',
      password: 'Reversed123!@#',
      totpToken: '',
    },

    validate: {
      username: (value) => (value.trim() === '' ? 'username cannot be empty' : null),
      password: (value) => (value.trim() === '' ? 'password cannot be empty' : null),
      totpToken: (value) =>
        value.trim().length !== 6 && needsTOTPToken ? 'TOTP Token must have exactly 6 characters' : null,
    },
  });

  const login = async () => {
    const loginInput = new UserLoginInput({
      username: form.values.username,
      password: form.values.password,
      totpToken: form.values.totpToken,
    });

    const pfClient = buildBrowserSideClient();

    await pfClient
      .plainLogin(loginInput)
      .then((result: AxiosResponse<UserStatusResponse>) => {
        if (result.status === 205) {
          setNeedsTOTPToken(true);
          return;
        }
        router.push('/');
      })
      .catch((err: AxiosError<ServiceError>) => {
        setLoginError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <Container size="xs">
      <form onSubmit={form.onSubmit(login)}>
        <TextInput label="Username" placeholder="username" {...form.getInputProps('username')} />
        <PasswordInput label="Password" placeholder="hunter2" {...form.getInputProps('password')} />
        {needsTOTPToken && (
          <TextInput mt="md" label="TOTP Token" placeholder="123456" {...form.getInputProps('totpToken')} />
        )}

        {loginError && (
          <>
            <Space h="md" />
            <Alert title="Bummer!" color="red">
              {loginError}
            </Alert>
          </>
        )}

        <Group position="center">
          <Button type="submit" mt="sm">
            Login
          </Button>
        </Group>
      </form>
    </Container>
  );
}
