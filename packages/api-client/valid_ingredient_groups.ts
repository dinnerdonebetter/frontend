import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidIngredientGroupCreationRequestInput,
  ValidIngredientGroup,
  QueryFilter,
  ValidIngredientGroupUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidIngredientGroup(
  client: Axios,
  input: ValidIngredientGroupCreationRequestInput,
): Promise<ValidIngredientGroup> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ValidIngredientGroup>>(backendRoutes.VALID_INGREDIENT_GROUPS, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getValidIngredientGroup(
  client: Axios,
  validIngredientGroupID: string,
): Promise<ValidIngredientGroup> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<ValidIngredientGroup>>(
      format(backendRoutes.VALID_INGREDIENT_GROUP, validIngredientGroupID),
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getValidIngredientGroups(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientGroup>>> {
  return client.get<QueryFilteredResult<ValidIngredientGroup>>(format(backendRoutes.VALID_INGREDIENT_GROUPS), {
    params: filter.asRecord(),
  });
}

export async function updateValidIngredientGroup(
  client: Axios,
  validIngredientGroupID: string,
  input: ValidIngredientGroupUpdateRequestInput,
): Promise<AxiosResponse<ValidIngredientGroup>> {
  return client.put<ValidIngredientGroup>(format(backendRoutes.VALID_INGREDIENT_GROUP, validIngredientGroupID), input);
}

export async function deleteValidIngredientGroup(
  client: Axios,
  validIngredientGroupID: string,
): Promise<AxiosResponse<ValidIngredientGroup>> {
  return client.delete(format(backendRoutes.VALID_INGREDIENT_GROUP, validIngredientGroupID));
}

export async function searchForValidIngredientGroups(
  client: Axios,
  query: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredientGroup[]>> {
  const p = filter.asRecord();
  p['q'] = query;

  return client.get<ValidIngredientGroup[]>(backendRoutes.VALID_INGREDIENT_GROUPS_SEARCH, { params: p });
}
