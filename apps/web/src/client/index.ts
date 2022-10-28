import { GetServerSidePropsContext } from 'next';
import router from 'next/router';

import PrixFixeAPIClient from 'api-client';

import { cookieName } from '../constants';

export const buildServerSideClient = (context: GetServerSidePropsContext): PrixFixeAPIClient => {
  const apiClientID = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiClientID) {
    throw new Error('no API client ID set!');
  }

  const pfClient = new PrixFixeAPIClient(apiClientID, context.req.cookies[cookieName]);

  return pfClient;
};

export const buildCookielessServerSideClient = (): PrixFixeAPIClient => {
  const apiClientID = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiClientID) {
    throw new Error('no API client ID set!');
  }

  const pfClient = new PrixFixeAPIClient(apiClientID);

  return pfClient;
};

export const buildBrowserSideClient = (): PrixFixeAPIClient => {
  const pfClient = buildCookielessServerSideClient();

  pfClient.configureRouterRejectionInterceptor((loc: Location) => {
    const destParam = new URLSearchParams(loc.search).get('dest') ?? encodeURIComponent(`${loc.pathname}${loc.search}`);
    router.push({ pathname: '/login', query: { dest: destParam } });
  });

  return pfClient;
};
