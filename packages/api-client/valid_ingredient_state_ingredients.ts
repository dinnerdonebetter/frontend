import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';
import {
  QueryFilter,
  ValidIngredientStateIngredientCreationRequestInput,
  ValidIngredientStateIngredient,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getValidIngredientStateIngredient(
  client: Axios,
  validIngredientStateIngredientID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredientStateIngredient>>> {
  const uri = format(backendRoutes.VALID_INGREDIENT_STATE_INGREDIENT, validIngredientStateIngredientID);
  return client.get<APIResponse<ValidIngredientStateIngredient>>(uri);
}

export async function validIngredientStateIngredientsForIngredientStateID(
  client: Axios,
  validIngredientStateID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientStateIngredient>>> {
  const searchURL = format(
    backendRoutes.VALID_INGREDIENT_STATE_INGREDIENTS_SEARCH_BY_INGREDIENT_STATE,
    validIngredientStateID,
  );
  return client.get<QueryFilteredResult<ValidIngredientStateIngredient>>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function validIngredientStateIngredientsForIngredientID(
  client: Axios,
  validIngredientID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientStateIngredient>>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_STATE_INGREDIENTS_SEARCH_BY_INGREDIENT_ID, validIngredientID);
  return client.get<QueryFilteredResult<ValidIngredientStateIngredient>>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function createValidIngredientStateIngredient(
  client: Axios,
  input: ValidIngredientStateIngredientCreationRequestInput,
): Promise<AxiosResponse<APIResponse<ValidIngredientStateIngredient>>> {
  return client.post<APIResponse<ValidIngredientStateIngredient>>(
    backendRoutes.VALID_INGREDIENT_STATE_INGREDIENTS,
    input,
  );
}

export async function deleteValidIngredientStateIngredient(
  client: Axios,
  validIngredientStateIngredientID: string,
): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT_STATE_INGREDIENT, validIngredientStateIngredientID));
}
