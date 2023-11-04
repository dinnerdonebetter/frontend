import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidIngredientCreationRequestInput,
  ValidIngredient,
  QueryFilter,
  ValidIngredientUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidIngredient(
  client: Axios,
  input: ValidIngredientCreationRequestInput,
): Promise<ValidIngredient> {
  const response = await client.post<APIResponse<ValidIngredient>>(backendRoutes.VALID_INGREDIENTS, input);

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return response.data.data;
}

export async function getValidIngredient(client: Axios, validIngredientID: string): Promise<ValidIngredient> {
  const response = await client.get<APIResponse<ValidIngredient>>(
    format(backendRoutes.VALID_INGREDIENT, validIngredientID),
  );

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return response.data.data;
}

export async function getValidIngredients(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredient>>> {
  return client.get<QueryFilteredResult<ValidIngredient>>(format(backendRoutes.VALID_INGREDIENTS), {
    params: filter.asRecord(),
  });
}

export async function updateValidIngredient(
  client: Axios,
  validIngredientID: string,
  input: ValidIngredientUpdateRequestInput,
): Promise<ValidIngredient> {
  const response = await client.put<APIResponse<ValidIngredient>>(
    format(backendRoutes.VALID_INGREDIENT, validIngredientID),
    input,
  );

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return response.data.data;
}

export async function deleteValidIngredient(client: Axios, validIngredientID: string): Promise<ValidIngredient> {
  const response = await client.delete(format(backendRoutes.VALID_INGREDIENT, validIngredientID));

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return response.data.data;
}

export async function searchForValidIngredients(
  client: Axios,
  query: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<QueryFilteredResult<ValidIngredient>> {
  const p = filter.asRecord();
  p['q'] = query;

  const response = await client.get<APIResponse<ValidIngredient[]>>(backendRoutes.VALID_INGREDIENTS_SEARCH, {
    params: p,
  });

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  const result = new QueryFilteredResult<ValidIngredient>({
    data: response.data.data,
    totalCount: response.data.pagination?.totalCount,
    page: response.data.pagination?.page,
    limit: response.data.pagination?.limit,
  });

  return result;
}

export async function getValidIngredientsForPreparation(
  client: Axios,
  preparationID: string,
  query: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<QueryFilteredResult<ValidIngredient>> {
  const p = filter.asRecord();
  p['q'] = query;

  const response = await client.get<APIResponse<ValidIngredient[]>>(
    format(backendRoutes.VALID_INGREDIENTS_SEARCH_BY_PREPARATION_ID, preparationID),
    {
      params: p,
    },
  );

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  const result = new QueryFilteredResult<ValidIngredient>({
    data: response.data.data,
    totalCount: response.data.pagination?.totalCount,
    page: response.data.pagination?.page,
    limit: response.data.pagination?.limit,
  });

  return result;
}
