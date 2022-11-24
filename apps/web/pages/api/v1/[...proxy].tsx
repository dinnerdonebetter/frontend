import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ServiceError } from '@prixfixeco/models';

import { buildServerSideClientWithRawCookie } from '../../../lib/client';
import { serverSideTracer } from '../../../lib/tracer';
import { cookieName } from '../../../lib/constants';
import { buildServerSideLogger } from '../../../lib/logger';

const logger = buildServerSideLogger('recipe_search_route');

async function RecipeSearch(req: NextApiRequest, res: NextApiResponse) {
  const span = serverSideTracer.startSpan('RecipeSearch');

  const cookie = (req.headers['cookie'] || '').replace(`${cookieName}=`, '');
  if (!cookie) {
    logger.debug('cookie missing from request');
    res.status(401).send('no cookie attached');
    return;
  }

  const pfClient = buildServerSideClientWithRawCookie(cookie);
  const u = new URL(req.url || '', `http://${req.headers.host}`);

  const reqConfig: AxiosRequestConfig = {
    method: req.method,
    url: req.url,
    withCredentials: true,
  };

  if (req.body) {
    reqConfig.data = req.body;
  }

  await pfClient.client
    .request(reqConfig)
    .then((result: AxiosResponse) => {
      span.addEvent('response received');
      res.status(result.status || 200).json(result.data);
      return;
    })
    .catch((err: AxiosError<ServiceError>) => {
      span.addEvent('error received');
      logger.error(`${err.config.baseURL}${err.config.url}?${err.config.params}`, err.status, err.config);
      res.status(err.response?.status || 500).send('');
      return;
    });

  span.end();
}

export default RecipeSearch;
