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
): Promise<AxiosResponse<APIResponse<ValidIngredientGroup>>> {
  return client.post<APIResponse<ValidIngredientGroup>>(backendRoutes.VALID_INGREDIENT_GROUPS, input);
}

export async function getValidIngredientGroup(
  client: Axios,
  validIngredientGroupID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredientGroup>>> {
  return client.get<APIResponse<ValidIngredientGroup>>(
    format(backendRoutes.VALID_INGREDIENT_GROUP, validIngredientGroupID),
  );
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
): Promise<AxiosResponse<APIResponse<ValidIngredientGroup>>> {
  return client.put<APIResponse<ValidIngredientGroup>>(
    format(backendRoutes.VALID_INGREDIENT_GROUP, validIngredientGroupID),
    input,
  );
}

export async function deleteValidIngredientGroup(
  client: Axios,
  validIngredientGroupID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredientGroup>>> {
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
