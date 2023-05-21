import { EmailAddressVerificationRequestInput } from '@dinnerdonebetter/models';
import { AxiosError, AxiosResponse } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { buildCookielessServerSideClient } from '../src/client';
import { serverSideTracer } from '../src/tracer';

declare interface VerifyEmailAddressPageProps {}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<VerifyEmailAddressPageProps>> => {
  const span = serverSideTracer.startSpan('RegistrationPage.getServerSideProps');
  const apiClient = buildCookielessServerSideClient();

  const emailVerificationToken = context.query['t']?.toString() || '';
  await apiClient
    .verifyEmailAddress(new EmailAddressVerificationRequestInput({ emailVerificationToken }))
    .then((res: AxiosResponse) => {
      if (res.status === 202) {
        span.addEvent('email address verified');
      }
    })
    .catch((err: AxiosError) => {
      span.addEvent('email address verification failed');
      span.setStatus({
        code: err.response?.status || 500,
        message: err.message,
      });
    });

  span.end();

  return {
    redirect: {
      destination: `/`,
      permanent: false,
    },
  };
};

export default function VerifyEmailAddressPage(_props: VerifyEmailAddressPageProps): JSX.Element {
  return <></>;
}
