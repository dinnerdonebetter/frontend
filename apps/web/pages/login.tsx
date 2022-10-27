import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { TextInput, Button, Group } from '@mantine/core';
import { randomId } from '@mantine/hooks';


import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';
import { buildBrowserSideClient } from '../client';

export default function Login() {
  const router = useRouter();

  const [needsTOTPToken, setNeedsTOTPToken] = useState(false);
  const [loginError, setLoginError] = useState('');

  const login = async () => {
    const loginInput = new UserLoginInput({
      username: '',
      password: '',
      totpToken: '',
    });

    if (loginInput.username.trim() === '') {
      setLoginError('username cannot be empty');
      return;
    }

    if (loginInput.password.trim() === '') {
      setLoginError('password cannot be empty');
      return;
    }

    if (needsTOTPToken && loginInput.totpToken.trim().length != 6) {
      setLoginError('TOTP token must have six characters');
      return;
    }

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

    const form = useForm({
      initialValues: {
        name: '',
        email: '',
      },
    });

    return (
      <div style={{ maxWidth: 320, margin: 'auto' }}>
        <TextInput label="Name" placeholder="Name" {...form.getInputProps('name')} />
        <TextInput mt="md" label="Email" placeholder="Email" {...form.getInputProps('email')} />

        <Group position="center" mt="xl">
          <Button
            variant="outline"
            onClick={() =>
              form.setValues({
                name: randomId(),
                email: `${randomId()}@test.com`,
              })
            }
          >
            Set random values
          </Button>
        </Group>
      </div>
    );
}
