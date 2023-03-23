import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { IAPIError, UserLoginInput, UserStatusResponse } from '@prixfixeco/models';

import { buildCookielessServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';
import { processCookieHeader } from '../../src/auth';

async function LoginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const span = serverSideTracer.startSpan('LoginProxy');
    const input = req.body as UserLoginInput;

    const pfClient = buildCookielessServerSideClient();

    await pfClient
      .logIn(input)
      .then((result: AxiosResponse<UserStatusResponse>) => {
        span.addEvent('response received');
        if (result.status === 205) {
          res.status(205).send('');
          return;
        }

        const modifiedAPICookie = processCookieHeader(result);
        const webappCookieParts = modifiedAPICookie.split('; ');
        webappCookieParts[0] = `prixfixe_webapp=${result.data.userID}`;
        const webappCookie = webappCookieParts.join('; ');

        res.setHeader('Set-Cookie', [modifiedAPICookie, webappCookie]).status(202).send('');
      })
      .catch((err: AxiosError<IAPIError>) => {
        span.addEvent('error received');
        res.status(err.response?.status || 500).send('');
        return;
      });

    span.end();
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}

export default LoginRoute;
