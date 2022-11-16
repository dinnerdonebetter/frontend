import { GetServerSidePropsContext } from 'next';
import router from 'next/router';

import PrixFixeAPIClient from '@prixfixeco/api-client';

import { cookieName } from '../constants';

export const buildServerSideClient = (context: GetServerSidePropsContext): PrixFixeAPIClient => {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiEndpoint) {
    throw new Error('no API endpoint set!');
  }

  const pfClient = new PrixFixeAPIClient(apiEndpoint, context.req.cookies[cookieName]);

  return pfClient;
};

export const buildServerSideClientWithRawCookie = (cookie: string): PrixFixeAPIClient => {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiEndpoint) {
    throw new Error('no API endpoint set!');
  }

  if (!cookie) {
    throw new Error('no cookie set!');
  }

  const pfClient = new PrixFixeAPIClient(apiEndpoint, cookie);

  return pfClient;
};

export const buildCookielessServerSideClient = (): PrixFixeAPIClient => {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!apiEndpoint) {
    throw new Error('no API endpoint set!');
  }

  const pfClient = new PrixFixeAPIClient(apiEndpoint);

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
