import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidIngredientStateCreationRequestInput,
  ValidIngredientState,
  QueryFilter,
  ValidIngredientStateUpdateRequestInput,
  QueryFilteredResult,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidIngredientState(
  client: Axios,
  input: ValidIngredientStateCreationRequestInput,
): Promise<AxiosResponse<ValidIngredientState>> {
  return client.post<ValidIngredientState>(backendRoutes.VALID_INGREDIENT_STATES, input);
}

export async function getValidIngredientState(
  client: Axios,
  validIngredientStateID: string,
): Promise<AxiosResponse<ValidIngredientState>> {
  return client.get<ValidIngredientState>(format(backendRoutes.VALID_INGREDIENT_STATE, validIngredientStateID));
}

export async function getValidIngredientStates(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientState>>> {
  return client.get<QueryFilteredResult<ValidIngredientState>>(backendRoutes.VALID_INGREDIENT_STATES, {
    params: filter.asRecord(),
  });
}

export async function updateValidIngredientState(
  client: Axios,
  validIngredientStateID: string,
  input: ValidIngredientStateUpdateRequestInput,
): Promise<AxiosResponse<ValidIngredientState>> {
  return client.put<ValidIngredientState>(format(backendRoutes.VALID_INGREDIENT_STATE, validIngredientStateID), input);
}

export async function deleteValidIngredientState(
  client: Axios,
  validIngredientStateID: string,
): Promise<AxiosResponse<ValidIngredientState>> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT_STATE, validIngredientStateID));
}

export async function searchForValidIngredientStates(
  client: Axios,
  query: string,
): Promise<AxiosResponse<ValidIngredientState[]>> {
  const searchURL = `${backendRoutes.VALID_INGREDIENT_STATES_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidIngredientState[]>(searchURL);
}
