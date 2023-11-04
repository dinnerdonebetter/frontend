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

export async function createRecipe(client: Axios, input: RecipeCreationRequestInput): Promise<Recipe> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<Recipe>>(backendRoutes.RECIPES, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getRecipe(client: Axios, recipeID: string): Promise<AxiosResponse<Recipe>> {
  return client.get<Recipe>(format(backendRoutes.RECIPE, recipeID));
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
): Promise<AxiosResponse<Recipe>> {
  return client.put<Recipe>(format(backendRoutes.RECIPE, recipeID), input);
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
