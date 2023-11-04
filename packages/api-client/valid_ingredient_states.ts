import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidIngredientStateCreationRequestInput,
  ValidIngredientState,
  QueryFilter,
  ValidIngredientStateUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidIngredientState(
  client: Axios,
  input: ValidIngredientStateCreationRequestInput,
): Promise<ValidIngredientState> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ValidIngredientState>>(backendRoutes.VALID_INGREDIENT_STATES, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
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
