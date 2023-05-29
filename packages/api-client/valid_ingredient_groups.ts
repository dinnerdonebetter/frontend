import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidIngredientGroupCreationRequestInput,
  ValidIngredientGroup,
  QueryFilter,
  ValidIngredientGroupUpdateRequestInput,
  QueryFilteredResult,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidIngredientGroup(
  client: Axios,
  input: ValidIngredientGroupCreationRequestInput,
): Promise<AxiosResponse<ValidIngredientGroup>> {
  return client.post<ValidIngredientGroup>(backendRoutes.VALID_INGREDIENT_GROUPS, input);
}

export async function getValidIngredientGroup(
  client: Axios,
  validIngredientGroupID: string,
): Promise<AxiosResponse<ValidIngredientGroup>> {
  return client.get<ValidIngredientGroup>(format(backendRoutes.VALID_INGREDIENT_GROUP, validIngredientGroupID));
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
