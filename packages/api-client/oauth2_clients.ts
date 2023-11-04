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
): Promise<OAuth2Client> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<OAuth2Client>>(backendRoutes.OAUTH2_CLIENTS, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getOAuth2Client(client: Axios, oauth2ClientID: string): Promise<OAuth2Client> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<OAuth2Client>>(format(backendRoutes.OAUTH2_CLIENT, oauth2ClientID));

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getOAuth2Clients(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<OAuth2Client>>> {
  return client.get<QueryFilteredResult<OAuth2Client>>(backendRoutes.OAUTH2_CLIENTS, {
    params: filter.asRecord(),
  });
}

export async function deleteOAuth2Client(client: Axios, oauth2ClientID: string): Promise<AxiosResponse<OAuth2Client>> {
  return client.delete(format(backendRoutes.OAUTH2_CLIENT, oauth2ClientID));
}
