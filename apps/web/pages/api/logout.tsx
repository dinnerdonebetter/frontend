import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { buildServerSideClientWithRawCookie } from '../../src/client';
import { buildServerSideLogger } from '../../src/logger';
import { cookieName } from '../../src/constants';
import { cookieStringToMap, processWebappCookieHeader } from '../../src/auth';
import { serverSideTracer } from '../../src/tracer';

const logger = buildServerSideLogger('logout_route');

async function LogoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const span = serverSideTracer.startSpan('LogoutRoute');

    const cookieMap = cookieStringToMap(req.headers['cookie'] || '');
    const cookie = cookieMap[cookieName];
    if (!cookie) {
      logger.debug('cookie missing from logout request');
      res.status(207).send('no cookie attached');
      return;
    }

    const apiClient = buildServerSideClientWithRawCookie(cookie);
    await apiClient
      .logOut()
      .then((result: AxiosResponse) => {
        span.addEvent('response received');

        logger.info('logout response received', result);

        const responseCookie = processWebappCookieHeader(result);
        res.setHeader('Set-Cookie', responseCookie).status(result.status).send('logged out');

        return;
      })
      .catch((err: AxiosError) => {
        span.addEvent('error received');
        logger.debug('error response received from logout', err.response?.status);
        res.status(207).send('error logging out');
        return;
      });

    span.end();
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}

export default LogoutRoute;
