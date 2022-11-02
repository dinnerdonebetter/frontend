import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { UserStatusResponse } from 'models';

import { buildServerSideClientWithRawCookie } from '../../src/client';

async function LogoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const cookie = req.headers['cookie'];
    if (!cookie) {
      res.status(401).send('no cookie attached');
      return;
    }

    // FIXME: does not work

    const pfClient = buildServerSideClientWithRawCookie(cookie);
    await pfClient
      .logOut()
      .then((result: AxiosResponse<UserStatusResponse>) => {
        console.log(result.request._redirectable._redirectCount);
        console.log(`logout result: ${result.request.headers}`);
        res.setHeader('Set-Cookie', '').status(202).send('setting empty cookie because we logged out');
        return;
      })
      .catch((err: AxiosError) => {
        console.log(`logout error: ${err}`);
        res.status(err.response?.status || 500).send('error logging out');
        return;
      });
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}

export default LogoutRoute;
