import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ServiceError, UserLoginInput, UserStatusResponse } from 'models';

import pfClient from '../../client';

async function LoginPage(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const input = req.body as UserLoginInput;

    await pfClient
      .logIn(input)
      .then((result: AxiosResponse<UserStatusResponse>) => {
        console.log('received login response from API');

        if (result.status === 205) {
          console.log('missing two factor response status from API');
          res.status(205).json({});
          return;
        }

        console.log(`received headers: "${JSON.stringify(result.headers['set-cookie'])}"`);

        let cookieHeader = result.headers['set-cookie']?.[0] ?? '';
        // TODO: this manipulation has to be done for local dev, but should obviously never be done in production.
        cookieHeader = cookieHeader.replace('prixfixe.dev', 'localhost').replace('Secure; ', '');

        res.setHeader('Set-Cookie', cookieHeader).status(202).json({});
        console.log(`set headers: "${cookieHeader}"`);
      })
      .catch((err: AxiosError<ServiceError>) => {
        console.error(err);
        console.log(`setting status to "${err.request.status}"`);
        res.status(err.request.status).json({});
        return;
      });
  } else {
    res.status(405).json({});
  }
}

export default LoginPage;
