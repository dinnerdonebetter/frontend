import { Button, Grid, PasswordInput, Space, Stack } from '@mantine/core';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { useRouter } from 'next/router';
import { z } from 'zod';

import { PasswordResetTokenRedemptionRequestInput } from '@prixfixeco/models';

import { buildBrowserSideClient } from '../src/client';
import { AppLayout } from '../src/layouts';
import { serverSideTracer } from '../src/tracer';
import { useForm, zodResolver } from '@mantine/form';

declare interface ResetPasswordPageProps {
  token: string;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ResetPasswordPageProps>> => {
  const span = serverSideTracer.startSpan('RegistrationPage.getServerSideProps');

  const token = context.query['t']?.toString() || '';
  let props: GetServerSidePropsResult<ResetPasswordPageProps> = {
    props: {
      token: token,
    },
  };

  span.end();
  return props;
};

const passwordResetFormSchema = z.object({
  password: z.string().min(8, 'password must have at least 8 characters').trim(),
  repeatedPassword: z.string().min(8, 'repeated password must have at least 8 characters').trim(),
});

function ResetPasswordPage(props: ResetPasswordPageProps) {
  const { token } = props;
  const router = useRouter();
  const apiClient = buildBrowserSideClient();

  const passwordResetForm = useForm({
    initialValues: {
      password: '',
      repeatedPassword: '',
    },

    validate: zodResolver(passwordResetFormSchema),
  });

  const redeemToken = async () => {
    const proceed = confirm('Are you sure you want to accept this invite?');
    if (proceed) {
      await apiClient.redeemPasswordResetToken(new PasswordResetTokenRedemptionRequestInput({ token })).then(() => {
        router.push('/login');
      });
    }
  };

  return (
    <AppLayout title="Reset Password">
      <form onSubmit={passwordResetForm.onSubmit(redeemToken)}>
        <Grid mt="xl">
          <Grid.Col span={4}>
            <Space h="xl" />
          </Grid.Col>
          <Grid.Col span="auto">
            <Stack>
              <PasswordInput
                data-pf="password-reset-new-input"
                label="New Password"
                required
                placeholder="hunter2"
                {...passwordResetForm.getInputProps('password')}
              />
              <PasswordInput
                data-pf="password-reset-new-confirm-input"
                label="New Password (again)"
                placeholder="hunter2"
                required
                {...passwordResetForm.getInputProps('repeatedPassword')}
              />

              <Button data-pf="password-reset-button" type="submit" mt="lg" fullWidth>
                Reset Password
              </Button>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Space h="xl" />
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}

export default ResetPasswordPage;