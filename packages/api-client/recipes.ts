import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  RecipeCreationRequestInput,
  Recipe,
  QueryFilter,
  RecipeList,
  RecipeUpdateRequestInput,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function createRecipe(client: Axios, input: RecipeCreationRequestInput): Promise<AxiosResponse<Recipe>> {
  return client.post<Recipe>(backendRoutes.RECIPES, input);
}

export async function getRecipe(client: Axios, recipeID: string): Promise<AxiosResponse<Recipe>> {
  return client.get<Recipe>(format(backendRoutes.RECIPE, recipeID));
}

export async function getRecipes(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<RecipeList>> {
  return client.get<RecipeList>(backendRoutes.RECIPES, { params: filter.asRecord() });
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

export async function searchForRecipes(client: Axios, query: string): Promise<AxiosResponse<RecipeList>> {
  const searchURL = `${backendRoutes.RECIPES_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<RecipeList>(searchURL);
}
