import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { IAPIError } from '@prixfixeco/models';
import { buildServerSideLogger } from '@prixfixeco/logger';

import { buildServerSideClientWithRawCookie } from '../../../src/client';
import { serverSideTracer } from '../../../src/tracer';
import { apiCookieName } from '../../../src/constants';

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

  switch ((req.headers['content-type'] || '').split(';')[0]) {
    case 'multipart/form-data':
      console.log('multipart/form-data received');
      const result = await apiClient.client.request({
        url: req.url,
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] ?? 'multipart/form-data',
          'User-Agent': req.headers['user-agent'] ?? '',
          'Authorization': 'Bearer Token',
        },
        data: req.body,
      });

      res.status(result.status).end();
      return;
    default:
      const copiedHeaders: Record<string, string> = {};
      for (let key in req.headers) {
        if (!['origin', 'host'].includes(key)) {
          copiedHeaders[key] = req.headers[key]?.toString() || '';
        }
      }

      console.log(`proxying request to ${req.url} with headers: ${JSON.stringify(copiedHeaders)}`);

      const reqConfig: AxiosRequestConfig = {
        method: req.method,
        url: req.url,
        withCredentials: true,
        headers: copiedHeaders,
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
          res.status(err.response?.status || 500).send(err.response?.data || '');
          return;
        });

      span.end();

      break;
  }
}

export default APIProxy;
