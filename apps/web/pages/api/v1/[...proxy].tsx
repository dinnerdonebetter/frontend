import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { IAPIError } from '@prixfixeco/models';

import { buildServerSideClientWithRawCookie } from '../../../src/client';
import { serverSideTracer } from '../../../src/tracer';
import { apiCookieName } from '../../../src/constants';
import { buildServerSideLogger } from '@prixfixeco/logger';

const logger = buildServerSideLogger('api_proxy');

async function APIProxy(req: NextApiRequest, res: NextApiResponse) {
  const span = serverSideTracer.startSpan('APIProxy');

  const cookie = (req.headers['cookie'] || '').replace(`${apiCookieName}=`, '');
  if (!cookie) {
    logger.debug('cookie missing from request');
    res.status(401).send('no cookie attached');
    return;
  }

  const apiClient = buildServerSideClientWithRawCookie(cookie);
  const u = new URL(req.url || '', `http://${req.headers.host}`);

  const reqConfig: AxiosRequestConfig = {
    method: req.method,
    url: req.url,
    withCredentials: true,
  };

  if (req.body) {
    reqConfig.data = req.body;
  }

  await apiClient.client
    .request(reqConfig)
    .then((result: AxiosResponse) => {
      span.addEvent('response received');
      res.status(result.status || 200).json(result.data);
      return;
    })
    .catch((err: AxiosError<IAPIError>) => {
      span.addEvent('error received');
      logger.error(`${err.config.baseURL}${err.config.url}?${err.config.params}`, err.status, err.config);
      res.status(err.response?.status || 500).send('');
      return;
    });

  span.end();
}

export default APIProxy;
