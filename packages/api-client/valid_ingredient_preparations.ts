import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';
import {
  QueryFilter,
  ValidIngredientPreparationCreationRequestInput,
  ValidIngredientPreparation,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getValidIngredientPreparation(
  client: Axios,
  validIngredientPreparationID: string,
): Promise<ValidIngredientPreparation> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<ValidIngredientPreparation>>(
      format(backendRoutes.VALID_INGREDIENT_PREPARATION, validIngredientPreparationID),
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function validIngredientPreparationsForPreparationID(
  client: Axios,
  validPreparationID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientPreparation>>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_PREPARATIONS_SEARCH_BY_PREPARATION_ID, validPreparationID);
  return client.get<QueryFilteredResult<ValidIngredientPreparation>>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function validIngredientPreparationsForIngredientID(
  client: Axios,
  validIngredientID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientPreparation>>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_PREPARATIONS_SEARCH_BY_INGREDIENT_ID, validIngredientID);
  return client.get<QueryFilteredResult<ValidIngredientPreparation>>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function createValidIngredientPreparation(
  client: Axios,
  input: ValidIngredientPreparationCreationRequestInput,
): Promise<ValidIngredientPreparation> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ValidIngredientPreparation>>(
      backendRoutes.VALID_INGREDIENT_PREPARATIONS,
      input,
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function deleteValidIngredientPreparation(
  client: Axios,
  validIngredientPreparationID: string,
): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT_PREPARATION, validIngredientPreparationID));
}
