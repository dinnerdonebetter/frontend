import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';

import { buildCookielessServerSideClient } from '../../src/client';

async function LoginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const input = req.body as UserLoginInput;

    const pfClient = buildCookielessServerSideClient();

    await pfClient
      .logIn(input)
      .then((result: AxiosResponse<UserStatusResponse>) => {
        if (result.status === 205) {
          res.status(205).send('');
          return;
        }

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

        res.setHeader('Set-Cookie', cookieHeader).status(202).send('');
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
