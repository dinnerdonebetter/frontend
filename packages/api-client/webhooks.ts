import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import { WebhookCreationRequestInput, Webhook, QueryFilter, QueryFilteredResult } from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createWebhook(
  client: Axios,
  input: WebhookCreationRequestInput,
): Promise<AxiosResponse<Webhook>> {
  return client.post<Webhook>(backendRoutes.VALID_PREPARATIONS, input);
}

export async function getWebhook(client: Axios, WebhookID: string): Promise<AxiosResponse<Webhook>> {
  return client.get<Webhook>(format(backendRoutes.VALID_PREPARATION, WebhookID));
}

export async function getWebhooks(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<Webhook>>> {
  return client.get<QueryFilteredResult<Webhook>>(backendRoutes.VALID_PREPARATIONS, {
    params: filter.asRecord(),
  });
}

export async function deleteWebhook(client: Axios, WebhookID: string): Promise<AxiosResponse<Webhook>> {
  return client.delete(format(backendRoutes.VALID_PREPARATION, WebhookID));
}

export async function searchForWebhooks(client: Axios, query: string): Promise<AxiosResponse<Webhook[]>> {
  const searchURL = `${backendRoutes.VALID_PREPARATIONS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<Webhook[]>(searchURL);
}
