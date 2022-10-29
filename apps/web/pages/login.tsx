import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { Alert, TextInput, PasswordInput, Button, Group, Space } from '@mantine/core';
import { z } from 'zod';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';
import { buildBrowserSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';

const loginFormSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(8, 'password must have at least 8 characters'),
  totpToken: z.string().optional().or(z.string().length(6)),
});

export default function Login() {
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
    const validation = loginForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const loginInput = new UserLoginInput({
      username: loginForm.values.username,
      password: loginForm.values.password,
      totpToken: loginForm.values.totpToken,
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
    <AppLayout>
      <form onSubmit={loginForm.onSubmit(login)}>
        <TextInput label="Username" placeholder="username" {...loginForm.getInputProps('username')} />
        <PasswordInput label="Password" placeholder="hunter2" {...loginForm.getInputProps('password')} />
        {needsTOTPToken && (
          <TextInput mt="md" label="TOTP Token" placeholder="123456" {...loginForm.getInputProps('totpToken')} />
        )}

        {loginError && (
          <>
            <Space h="md" />
            <Alert title="Oh no!" color="red">
              {loginError}
            </Alert>
          </>
        )}

        <Group position="center">
          <Button type="submit" mt="sm" fullWidth>
            Login
          </Button>
        </Group>
      </form>
    </AppLayout>
  );
}
