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
): Promise<AxiosResponse<APIResponse<ValidIngredient>>> {
  return client.post<APIResponse<ValidIngredient>>(backendRoutes.VALID_INGREDIENTS, input);
}

export async function getValidIngredient(
  client: Axios,
  validIngredientID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredient>>> {
  return client.get<APIResponse<ValidIngredient>>(format(backendRoutes.VALID_INGREDIENT, validIngredientID));
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
): Promise<AxiosResponse<APIResponse<ValidIngredient>>> {
  return client.put<APIResponse<ValidIngredient>>(format(backendRoutes.VALID_INGREDIENT, validIngredientID), input);
}

export async function deleteValidIngredient(
  client: Axios,
  validIngredientID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredient>>> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT, validIngredientID));
}

export async function searchForValidIngredients(
  client: Axios,
  query: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredient[]>> {
  const p = filter.asRecord();
  p['q'] = query;

  return client.get<ValidIngredient[]>(backendRoutes.VALID_INGREDIENTS_SEARCH, { params: p });
}

export async function getValidIngredientsForPreparation(
  client: Axios,
  preparationID: string,
  query: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredient>>> {
  const p = filter.asRecord();
  p['q'] = query;

  return client.get<QueryFilteredResult<ValidIngredient>>(
    format(backendRoutes.VALID_INGREDIENTS_SEARCH_BY_PREPARATION_ID, preparationID),
    {
      params: p,
    },
  );
}
