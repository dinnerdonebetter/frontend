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

const logger = buildServerSideLogger('auth');

export function processWebappCookieHeader(result: AxiosResponse, userID: string, householdID: string): string[] {
  const span = serverSideTracer.startSpan('processWebappCookieHeader');

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

  const webappCookie = buildWebappCookieFromAPICookie(cookieHeader, userID, householdID);

  span.end();
  return [cookieHeader, webappCookie];
}

// don't ask me how it works, I don't know. I just copied it from the internet.
export const cookieStringToMap = (cookie: string): { [key: string]: string } =>
  cookie.split('; ').reduce((prev: { [key: string]: string }, current: string) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
  }, {});

const buildWebappCookieFromAPICookie = (cookie: string, userID: string, householdID: string): string => {
  const webappCookieMap = cookieStringToMap(cookie);

  webappCookieMap['Samesite'] = 'true';
  delete webappCookieMap[cookieName];
  webappCookieMap[WebappCookieName] = Buffer.from(
    JSON.stringify({ userID, householdID } as sessionAuth),
    'ascii',
  ).toString('base64');

  return `${WebappCookieName}=${webappCookieMap[WebappCookieName]}; ${Object.keys(webappCookieMap)
    .filter((x) => x !== WebappCookieName)
    .map((k: string) => `${k}${webappCookieMap[k] ? '=' : ''}${webappCookieMap[k] || ''}`)
    .join('; ')}`;
};

export const extractUserInfoFromCookie = (cookies: NextApiRequestCookies): sessionAuth => {
  const data = cookies[WebappCookieName] || 'e30=';
  const userSessionData = JSON.parse(Buffer.from(data, 'base64').toString('ascii')) as sessionAuth;
  return userSessionData;
};
