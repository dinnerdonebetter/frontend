import { AxiosResponse } from 'axios';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { buildServerSideLogger } from '../logger';

import { serverSideTracer } from '../tracer';

export const cookieName = 'prixfixecookie';
export const WebappCookieName = 'prixfixe_webapp';

export interface sessionAuth {
  userID: string;
  householdID: string;
}

const logger = buildServerSideLogger('cookie-manip');

export function processWebappCookieHeader(result: AxiosResponse, userID: string, householdID: string): string {
  const span = serverSideTracer.startSpan('processCookieHeader');

  let apiCookie = result.headers['set-cookie']?.[0] ?? '';
  if (!apiCookie) {
    throw new Error('missing cookie header');
  }

  const originalCookie = apiCookie;

  if (process.env.REWRITE_COOKIE_HOST_FROM && process.env.REWRITE_COOKIE_HOST_TO) {
    apiCookie = apiCookie.replace(process.env.REWRITE_COOKIE_HOST_FROM, process.env.REWRITE_COOKIE_HOST_TO);
    logger.info(`rewrote cookie host`);
    span.addEvent('cookie host rewritten');
  }

  if (process.env.REWRITE_COOKIE_SECURE === 'true') {
    apiCookie = apiCookie.replace('Secure; ', '');
    logger.info(`rewrote secure cookie string`);
    span.addEvent('secure setting rewritten in cookie');
  }

  const webappCookieParts = apiCookie.split('; ');
  webappCookieParts.push(
    `${WebappCookieName}=${Buffer.from(JSON.stringify({ userID, householdID } as sessionAuth), 'ascii').toString(
      'base64',
    )}`,
  );
  apiCookie = webappCookieParts.join('; ');

  logger.info(`processWebappCookieHeader: ${originalCookie} -> ${apiCookie}`);

  span.end();
  return apiCookie;
}

export const extractUserInfoFromCookie = (cookies: NextApiRequestCookies): sessionAuth => {
  const cookieParts = cookies[cookieName]?.split('; ') ?? [];
  const sessionAuthCookie = cookieParts.find((part) => part.startsWith(WebappCookieName));
  if (!sessionAuthCookie) {
    return {} as sessionAuth;
  }

  logger.info('cookieParts: ', cookieParts.join(', '));

  const data = sessionAuthCookie.split('=')[1];
  return JSON.parse(Buffer.from(data, 'base64').toString('ascii')) as sessionAuth;
};
