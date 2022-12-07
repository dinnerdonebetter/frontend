import { AxiosResponse } from 'axios';

import { serverSideTracer } from '../tracer';

export function processCookieHeader(result: AxiosResponse): string {
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

  span.end();
  return cookieHeader;
}
