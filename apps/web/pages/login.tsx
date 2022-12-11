import { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { Alert, TextInput, PasswordInput, Button, Group, Space, Grid, Text, Container } from '@mantine/core';
import { z } from 'zod';

import { IAPIError, UserLoginInput, UserStatusResponse } from '@prixfixeco/models';

import { AppLayout } from '../lib/layouts';
import Link from 'next/link';

const loginFormSchema = z.object({
  username: z.string().min(1, 'username is required').trim(),
  password: z.string().min(8, 'password must have at least 8 characters').trim(),
  totpToken: z.string().optional().or(z.string().regex(/\d{6}/, 'token must be 6 digits').trim()),
});

export default function Login(): JSX.Element {
  const router = useRouter();

  const [needsTOTPToken, setNeedsTOTPToken] = useState(false);
  const [loginError, setLoginError] = useState('');

  const loginForm = useForm({
    initialValues: {
      username: '',
      password: '',
      totpToken: '',
    },
    validate: zodResolver(loginFormSchema),
  });

  const login = async () => {
    if (loginForm.validate().hasErrors) {
      return;
    }

    const loginInput = new UserLoginInput({
      username: loginForm.values.username,
      password: loginForm.values.password,
      totpToken: loginForm.values.totpToken,
    });

    await axios
      .post('/api/login', loginInput)
      .then((result: AxiosResponse<UserStatusResponse>) => {
        if (result.status === 205) {
          setNeedsTOTPToken(true);
          return;
        }

        const redirect = decodeURIComponent(new URLSearchParams(window.location.search).get('dest') || '').trim();

        router.push(redirect || '/');
      })
      .catch((err: AxiosError<IAPIError>) => {
        setLoginError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout title="Login">
      <Container size="xs">
        <form onSubmit={loginForm.onSubmit(login)}>
          <TextInput label="Username" placeholder="username" {...loginForm.getInputProps('username')} />
          <PasswordInput label="Password" placeholder="hunter2" {...loginForm.getInputProps('password')} />
          {needsTOTPToken && (
            <TextInput mt="md" label="TOTP Token" placeholder="123456" {...loginForm.getInputProps('totpToken')} />
          )}

          {loginError && (
            <>
              <Space h="md" />
              <Alert title="Oh no!" color="tomato">
                {loginError}
              </Alert>
            </>
          )}

          <Group position="center">
            <Button type="submit" mt="sm" fullWidth>
              Login
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
                <Link href="/register">Register instead</Link>
              </Text>
            </Grid.Col>
          </Grid>
        </form>
      </Container>
    </AppLayout>
  );
}
