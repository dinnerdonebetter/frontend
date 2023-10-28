import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidPreparationCreationRequestInput,
  ValidPreparation,
  QueryFilter,
  ValidPreparationUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidPreparation(
  client: Axios,
  input: ValidPreparationCreationRequestInput,
): Promise<AxiosResponse<APIResponse<ValidPreparation>>> {
  return client.post<APIResponse<ValidPreparation>>(backendRoutes.VALID_PREPARATIONS, input);
}

export async function getValidPreparation(
  client: Axios,
  validPreparationID: string,
): Promise<AxiosResponse<APIResponse<ValidPreparation>>> {
  return client.get<APIResponse<ValidPreparation>>(format(backendRoutes.VALID_PREPARATION, validPreparationID));
}

export async function getValidPreparations(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidPreparation>>> {
  return client.get<QueryFilteredResult<ValidPreparation>>(backendRoutes.VALID_PREPARATIONS, {
    params: filter.asRecord(),
  });
}

export async function updateValidPreparation(
  client: Axios,
  validPreparationID: string,
  input: ValidPreparationUpdateRequestInput,
): Promise<AxiosResponse<APIResponse<ValidPreparation>>> {
  return client.put<APIResponse<ValidPreparation>>(format(backendRoutes.VALID_PREPARATION, validPreparationID), input);
}

export async function deleteValidPreparation(
  client: Axios,
  validPreparationID: string,
): Promise<AxiosResponse<APIResponse<ValidPreparation>>> {
  return client.delete(format(backendRoutes.VALID_PREPARATION, validPreparationID));
}

export async function searchForValidPreparations(
  client: Axios,
  query: string,
): Promise<AxiosResponse<ValidPreparation[]>> {
  const searchURL = `${backendRoutes.VALID_PREPARATIONS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidPreparation[]>(searchURL);
}
