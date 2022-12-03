import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { buildServerSideClientWithRawCookie } from '../../lib/client';
import { buildServerSideLogger } from '../../lib/logger';
import { cookieName } from '../../lib/constants';
import { processCookieHeader } from '../../lib/auth';
import { serverSideTracer } from '../../lib/tracer';

const logger = buildServerSideLogger('logout_route');

async function LogoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const span = serverSideTracer.startSpan('LogoutRoute');

    const cookie = (req.headers['cookie'] || '').replace(`${cookieName}=`, '');
    if (!cookie) {
      logger.debug('cookie missing from logout request');
      res.status(401).send('no cookie attached');
      return;
    }

    logger.info('logging user out');

    const pfClient = buildServerSideClientWithRawCookie(cookie);
    await pfClient
      .logOut()
      .then((result: AxiosResponse) => {
        span.addEvent('response received');
        const responseCookie = processCookieHeader(result);
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
