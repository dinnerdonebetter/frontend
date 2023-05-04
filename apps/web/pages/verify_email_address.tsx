import { EmailAddressVerificationRequestInput } from '@prixfixeco/models';
import { AxiosResponse } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { extractUserInfoFromCookie } from '../src/auth';
import { buildCookielessServerSideClient } from '../src/client';
import { serverSideTracer } from '../src/tracer';

declare interface VerifyEmailAddressPageProps {}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<VerifyEmailAddressPageProps>> => {
  const span = serverSideTracer.startSpan('RegistrationPage.getServerSideProps');
  const apiClient = buildCookielessServerSideClient();

  const emailVerificationToken = context.query['t']?.toString() || '';
  let props: GetServerSidePropsResult<VerifyEmailAddressPageProps> = {
    props: {},
  };

  await apiClient
    .verifyEmailAddress(new EmailAddressVerificationRequestInput({ emailVerificationToken }))
    .then((res: AxiosResponse) => {
      if (res.status === 202) {
        span.addEvent('email address verified');
        props = {
          redirect: {
            destination: `/`,
            permanent: false,
          },
        };
      }
    });

  span.end();

  return props;
};

export default function VerifyEmailAddressPage(props: VerifyEmailAddressPageProps): JSX.Element {
  return <></>;
}
