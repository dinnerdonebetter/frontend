import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useInput, Button, Input, Spacer, Card, Grid, Text } from '@geist-ui/core';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';
import { buildBrowserSideClient } from '../client';

export default function Login() {
  const router = useRouter();

  const [needsTOTPToken, setNeedsTOTPToken] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    state: username,
    setState: setUsername,
    reset: resetUsername,
    bindings: usernameBindings,
  } = useInput('testing');
  const {
    state: password,
    setState: setPassword,
    reset: resetPassword,
    bindings: passwordBindings,
  } = useInput('Reversed123!@#');
  const { state: totpToken, setState: setTOTPToken, reset: resetTOTPToken, bindings: totpTokenBindings } = useInput('');

  const login = async () => {
    const loginInput = new UserLoginInput({
      username,
      password,
      totpToken,
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

  return (
    <Grid.Container gap={2} justify="center" height="100%" direction="row">
      <Grid xs={0}></Grid>
      <Grid xs={24} justify="center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <Spacer h={1} />
          <Input
            id="usernameInput"
            placeholder="username"
            width="100%"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          >
            Username
          </Input>

          <Spacer h={0.5} />
          <Input.Password
            id="passwordInput"
            placeholder="password"
            width="100%"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          >
            Password
          </Input.Password>

          {needsTOTPToken && (
            <>
              <Spacer h={0.5} />
              <Input
                id="totpTokenInput"
                placeholder="TOTP Token"
                width="100%"
                value={totpToken}
                onChange={(e) => {
                  setTOTPToken(e.target.value);
                }}
              >
                TOTP Token
              </Input>
            </>
          )}

          {loginError.trim() !== '' && (
            <>
              <Spacer h={1} />
              <Text span type="error">
                {loginError}
              </Text>
            </>
          )}

          <Spacer h={1} />
          <Button width={'100%'} onClick={login} disabled={username === '' || password === ''}>
            Login
          </Button>
        </form>
      </Grid>
      <Grid xs={8}></Grid>
    </Grid.Container>
  );
}
