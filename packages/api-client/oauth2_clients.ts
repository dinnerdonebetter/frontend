import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  OAuth2ClientCreationRequestInput,
  OAuth2Client,
  QueryFilter,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createOAuth2Client(
  client: Axios,
  input: OAuth2ClientCreationRequestInput,
): Promise<AxiosResponse<APIResponse<OAuth2Client>>> {
  return client.post<APIResponse<OAuth2Client>>(backendRoutes.OAUTH2_CLIENTS, input);
}

export async function getOAuth2Client(
  client: Axios,
  oauth2ClientID: string,
): Promise<AxiosResponse<APIResponse<OAuth2Client>>> {
  return client.get<APIResponse<OAuth2Client>>(format(backendRoutes.OAUTH2_CLIENT, oauth2ClientID));
}

export async function getOAuth2Clients(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<OAuth2Client>>> {
  return client.get<QueryFilteredResult<OAuth2Client>>(backendRoutes.OAUTH2_CLIENTS, {
    params: filter.asRecord(),
  });
}

export async function deleteOAuth2Client(
  client: Axios,
  oauth2ClientID: string,
): Promise<AxiosResponse<APIResponse<OAuth2Client>>> {
  return client.delete(format(backendRoutes.OAUTH2_CLIENT, oauth2ClientID));
}
