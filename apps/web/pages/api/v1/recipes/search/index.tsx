import { AxiosError, AxiosResponse } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ServiceError } from '@prixfixeco/models';

import { buildServerSideClientWithRawCookie } from '../../../../../src/client';
import { serverSideTracer } from '../../../../../src/tracer';
import { cookieName } from '../../../../../src/constants';
import { buildServerSideLogger } from '../../../../../src/logger';

const logger = buildServerSideLogger('recipe_search_route');

async function RecipeSearch(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const span = serverSideTracer.startSpan('RecipeSearch');

    const cookie = (req.headers['cookie'] || '').replace(`${cookieName}=`, '');
    if (!cookie) {
      logger.debug('cookie missing from request');
      res.status(401).send('no cookie attached');
      return;
    }

    logger.info(`searching for recipes`, req.url);

    const pfClient = buildServerSideClientWithRawCookie(cookie);

    await pfClient
      .searchForRecipes(new URL(`https://api.prixfixe.com/${req.url}` || '').searchParams.get('q') || '')
      .then((result: AxiosResponse) => {
        span.addEvent('response received');
        res.status(result.status || 200).json(result.data);
        return;
      })
      .catch((err: AxiosError<ServiceError>) => {
        span.addEvent('error received');
        res.status(err.response?.status || 500).send('');
        return;
      });

    span.end();
  } else {
    res.status(405).send(`Method ${req.method} Not Allowed`);
  }
}

export default RecipeSearch;
