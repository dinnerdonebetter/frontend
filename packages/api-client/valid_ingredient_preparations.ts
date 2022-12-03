import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';
import {
  QueryFilter,
  ValidIngredientPreparationList,
  ValidIngredientPreparationCreationRequestInput,
  ValidIngredientPreparation,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function validIngredientPreparationsForPreparationID(
  client: Axios,
  validPreparationID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredientPreparationList>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_PREPARATIONS_SEARCH_BY_PREPARATION_ID, validPreparationID);
  return client.get<ValidIngredientPreparationList>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function validIngredientPreparationsForIngredientID(
  client: Axios,
  validIngredientID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredientPreparationList>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_PREPARATIONS_SEARCH_BY_INGREDIENT_ID, validIngredientID);
  return client.get<ValidIngredientPreparationList>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function createValidIngredientPreparation(
  client: Axios,
  input: ValidIngredientPreparationCreationRequestInput,
): Promise<AxiosResponse<ValidIngredientPreparation>> {
  return client.post<ValidIngredientPreparation>(backendRoutes.VALID_INGREDIENT_PREPARATIONS, input);
}

export async function deleteValidIngredientPreparation(
  client: Axios,
  validIngredientPreparationID: string,
): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT_PREPARATION, validIngredientPreparationID));
}
