import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  RecipeCreationRequestInput,
  Recipe,
  QueryFilter,
  RecipeUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createRecipe(
  client: Axios,
  input: RecipeCreationRequestInput,
): Promise<AxiosResponse<APIResponse<Recipe>>> {
  return client.post<APIResponse<Recipe>>(backendRoutes.RECIPES, input);
}

export async function getRecipe(client: Axios, recipeID: string): Promise<AxiosResponse<APIResponse<Recipe>>> {
  return client.get<APIResponse<Recipe>>(format(backendRoutes.RECIPE, recipeID));
}

export async function getRecipes(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<Recipe>>> {
  return client.get<QueryFilteredResult<Recipe>>(backendRoutes.RECIPES, { params: filter.asRecord() });
}

export async function updateRecipe(
  client: Axios,
  recipeID: string,
  input: RecipeUpdateRequestInput,
): Promise<AxiosResponse<APIResponse<Recipe>>> {
  return client.put<APIResponse<Recipe>>(format(backendRoutes.RECIPE, recipeID), input);
}

export async function deleteRecipe(client: Axios, recipeID: string): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.RECIPE, recipeID));
}

export async function searchForRecipes(
  client: Axios,
  query: string,
): Promise<AxiosResponse<QueryFilteredResult<Recipe>>> {
  const searchURL = `${backendRoutes.RECIPES_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<QueryFilteredResult<Recipe>>(searchURL);
}
