import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';

import { buildCookielessServerSideClient } from '../../src/client';
import { processCookieHeader } from '../../src/auth';

async function LoginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const input = req.body as UserLoginInput;

    const pfClient = buildCookielessServerSideClient();

    await pfClient
      .logIn(input)
      .then((result: AxiosResponse) => {
        if (result.status === 205) {
          res.status(205).send('');
          return;
        }

        res.setHeader('Set-Cookie', processCookieHeader(result)).status(202).send('');
      })
      .catch((err: AxiosError<ServiceError>) => {
        res.status(err.response?.status || 500).send('');
        return;
      });
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}

export default LoginRoute;
