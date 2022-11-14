import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { buildServerSideClientWithRawCookie } from '../../src/client';
import { buildServerSideLogger } from '../../src/logger';
import { cookieName } from '../../src/constants';
import { processCookieHeader } from '../../src/auth';
import { serverSideTracer } from '../../src/tracer';

async function LogoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const span = serverSideTracer.startSpan('LogoutRoute');
    const logger = buildServerSideLogger('recipes_list_route');

    const cookie = (req.headers['cookie'] || '').replace(`${cookieName}=`, '');
    if (!cookie) {
      logger.debug('cookie missing from logout request');
      res.status(401).send('no cookie attached');
      return;
    }

    // FIXME: does not work

    const pfClient = buildServerSideClientWithRawCookie(cookie);
    await pfClient
      .logOut()
      .then((result: AxiosResponse) => {
        const responseCookie = processCookieHeader(result);
        res.setHeader('Set-Cookie', responseCookie).status(result.status).send('logged out');
        return;
      })
      .catch((err: AxiosError) => {
        logger.debug('error response received from logout', err.response?.status);
        res.status(err.response?.status || 500).send('error logging out');
        return;
      });

    span.end();
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}

export default LogoutRoute;
