import { AxiosResponse } from "axios";

export function processCookieHeader(result: AxiosResponse): string {
    let cookieHeader = result.headers['set-cookie']?.[0] ?? '';
    if (!cookieHeader) {
      throw new Error('missing cookie header');
    }

    if (process.env.REWRITE_COOKIE_HOST_FROM && process.env.REWRITE_COOKIE_HOST_TO) {
      console.log(
        `rewriting cookie host from ${process.env.REWRITE_COOKIE_HOST_FROM} to ${process.env.REWRITE_COOKIE_HOST_TO}`,
      );
      cookieHeader = cookieHeader.replace(process.env.REWRITE_COOKIE_HOST_FROM, process.env.REWRITE_COOKIE_HOST_TO);
    }

    if (process.env.REWRITE_COOKIE_SECURE === 'true') {
      console.log(`replacing secure setting in cookie`);
      cookieHeader = cookieHeader.replace('Secure; ', '');
    }

    return cookieHeader;
  }