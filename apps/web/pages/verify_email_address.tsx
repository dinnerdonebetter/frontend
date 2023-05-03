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

  apiClient.verifyEmailAddress(new EmailAddressVerificationRequestInput({ emailVerificationToken })).then((res: AxiosResponse) => {
    if (res.status === 202) {
      span.addEvent('email address verified');
      return {
        redirect: {
          destination: `/`,
          permanent: false,
        },
      }
    }
  });

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (!userSessionData?.userID) {
    //
  }

  span.end();

  let props: GetServerSidePropsResult<VerifyEmailAddressPageProps> = {
    props: {
    },
  };

  return props;
};
