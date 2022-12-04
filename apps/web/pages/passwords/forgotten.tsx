import { useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm, zodResolver } from '@mantine/form';
import { Alert, TextInput, Button, Group, Space, Grid, Text, Container } from '@mantine/core';
import { z } from 'zod';

import { PasswordResetTokenCreationRequestInput, ServiceError, UserStatusResponse } from '@prixfixeco/models';

import { buildLocalClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';

const forgottenPasswordFormSchema = z.object({
  emailAddress: z.string().email('email address is required').trim(),
});

export default function ForgottenPassword(): JSX.Element {
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

    const pfClient = buildLocalClient();

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
    <AppLayout title="Forgotten Password">
      <Container size="xs">
        <form onSubmit={forgottenPasswordForm.onSubmit(submitForm)}>
          <TextInput
            label="Email Address"
            placeholder="cool@person.com"
            {...forgottenPasswordForm.getInputProps('emailAddress')}
          />

          {formSubmissionError && (
            <>
              <Space h="md" />
              <Alert title="Oh no!" color="tomato">
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
      </Container>
    </AppLayout>
  );
}
