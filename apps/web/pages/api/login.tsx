import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';

import { buildCookielessServerSideClient } from '../../src/client';
import { serverSideTracer } from '../../src/tracer';
import { processCookieHeader } from '../../src/auth';

async function LoginRoute(req: NextApiRequest, res: NextApiResponse) {
  const span = serverSideTracer.startSpan('LoginRoute');

  if (req.method === 'POST') {
    const input = req.body as UserLoginInput;

    const pfClient = buildCookielessServerSideClient();

    await pfClient
      .logIn(input)
      .then((result: AxiosResponse) => {
        span.addEvent('response received');
        if (result.status === 205) {
          res.status(205).send('');
          return;
        }

        res.setHeader('Set-Cookie', processCookieHeader(result)).status(202).send('');
      })
      .catch((err: AxiosError<ServiceError>) => {
        span.addEvent('error received');
        res.status(err.response?.status || 500).send('');
        return;
      });
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }

  span.end();
}

export default LoginRoute;
