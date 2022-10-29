import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import { useForm, zodResolver } from '@mantine/form';
import { Alert, TextInput, Button, Group, Space, Grid, Text } from '@mantine/core';
import { z } from 'zod';

import { PasswordResetTokenCreationRequestInput, ServiceError, UserStatusResponse } from 'models';

import { buildBrowserSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import Link from 'next/link';

const forgottenPasswordFormSchema = z.object({
  emailAddress: z.string().email('email address is required'),
});

export default function ForgottenPassword() {
  const router = useRouter();

  const forgottenPasswordForm = useForm({
    initialValues: {
      emailAddress: '',
    },
    validate: zodResolver(forgottenPasswordFormSchema),
  });

  const [formSubmissionError, setFormSubmissionError] = useState('');

  const submitForm = async () => {
    const validation = forgottenPasswordForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const loginInput = new PasswordResetTokenCreationRequestInput({
      emailAddress: forgottenPasswordForm.values.emailAddress,
    });

    const pfClient = buildBrowserSideClient();

    await pfClient
      .requestPasswordResetToken(loginInput)
      .then((_: AxiosResponse<UserStatusResponse>) => {
        router.push('/login');
      })
      .catch((err: AxiosError<ServiceError>) => {
        setFormSubmissionError(err?.response?.data.message || 'unknown error occurred');
      });
  };

  return (
    <AppLayout>
      <form onSubmit={forgottenPasswordForm.onSubmit(submitForm)}>
        <TextInput
          label="Email Address"
          placeholder="cool@person.com"
          {...forgottenPasswordForm.getInputProps('emailAddress')}
        />

        {formSubmissionError && (
          <>
            <Space h="md" />
            <Alert title="Oh no!" color="red">
              {formSubmissionError}
            </Alert>
          </>
        )}

        <Group position="center">
          <Button type="submit" mt="sm" fullWidth>
            Submit
          </Button>
        </Group>

        <Grid justify="space-between" mt={2}>
          <Grid.Col span="auto">
            <Text size="xs" align="right">
              <Link href="/login">Login instead</Link>
            </Text>
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}
