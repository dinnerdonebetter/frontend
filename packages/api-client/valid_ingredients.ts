import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidIngredientCreationRequestInput,
  ValidIngredient,
  QueryFilter,
  ValidIngredientList,
  ValidIngredientUpdateRequestInput,
} from 'models';
import { backendRoutes } from './routes';

export async function createValidIngredient(
  client: Axios,
  input: ValidIngredientCreationRequestInput,
): Promise<AxiosResponse<ValidIngredient>> {
  return client.post<ValidIngredient>(backendRoutes.VALID_INGREDIENTS, input);
}

export async function getValidIngredient(
  client: Axios,
  validIngredientID: string,
): Promise<AxiosResponse<ValidIngredient>> {
  return client.get<ValidIngredient>(format(backendRoutes.VALID_INGREDIENT, validIngredientID));
}

export async function getValidIngredients(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredientList>> {
  return client.get<ValidIngredientList>(format(backendRoutes.VALID_INGREDIENTS), {
    params: filter.asRecord(),
  });
}

export async function updateValidIngredient(
  client: Axios,
  validIngredientID: string,
  input: ValidIngredientUpdateRequestInput,
): Promise<AxiosResponse<ValidIngredient>> {
  return client.put<ValidIngredient>(format(backendRoutes.VALID_INGREDIENT, validIngredientID), input);
}

export async function deleteValidIngredient(
  client: Axios,
  validIngredientID: string,
): Promise<AxiosResponse<ValidIngredient>> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT, validIngredientID));
}

export async function searchForValidIngredients(
  client: Axios,
  query: string,
): Promise<AxiosResponse<ValidIngredient[]>> {
  const searchURL = `${backendRoutes.VALID_INGREDIENTS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidIngredient[]>(searchURL);
}
