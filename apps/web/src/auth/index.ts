import { AxiosResponse } from 'axios';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

import { serverSideTracer } from '../tracer';

export const cookieName = 'prixfixecookie';
export const WebappCookieName = 'prixfixe_webapp';

export interface sessionAuth {
  userID: string;
  householdID: string;
}

export function processWebappCookieHeader(result: AxiosResponse, userID: string, householdID: string): string[] {
  const span = serverSideTracer.startSpan('processCookieHeader');

  let cookieHeader = result.headers['set-cookie']?.[0] ?? '';
  if (!cookieHeader) {
    throw new Error('missing cookie header');
  }

  if (process.env.REWRITE_COOKIE_HOST_FROM && process.env.REWRITE_COOKIE_HOST_TO) {
    cookieHeader = cookieHeader.replace(process.env.REWRITE_COOKIE_HOST_FROM, process.env.REWRITE_COOKIE_HOST_TO);
    span.addEvent('cookie host rewritten');
  }

  if (process.env.REWRITE_COOKIE_SECURE === 'true') {
    cookieHeader = cookieHeader.replace('Secure; ', '');
    span.addEvent('secure setting rewritten in cookie');
  }

  const webappCookieParts = cookieHeader.split('; ');
  webappCookieParts[0] = `${WebappCookieName}=${Buffer.from(
    JSON.stringify({ userID, householdID } as sessionAuth),
    'ascii',
  ).toString('base64')}`;
  const webappCookie = webappCookieParts.join('; ');

  span.end();
  return [cookieHeader, webappCookie];
}

export const extractUserInfoFromCookie = (cookies: NextApiRequestCookies): sessionAuth => {
  const data = (cookies['prixfixe_webapp'] || Buffer.from('e30=', 'ascii')).toString();

  const userSessionData = JSON.parse(Buffer.from(data, 'base64').toString('ascii')) as sessionAuth;
  return userSessionData;
};
