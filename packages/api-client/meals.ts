import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  MealCreationRequestInput,
  Meal,
  MealUpdateRequestInput,
  QueryFilter,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createMeal(
  client: Axios,
  input: MealCreationRequestInput,
): Promise<AxiosResponse<APIResponse<Meal>>> {
  return client.post<APIResponse<Meal>>(backendRoutes.MEALS, input);
}

export async function getMeal(client: Axios, mealID: string): Promise<AxiosResponse<APIResponse<Meal>>> {
  return client.get<APIResponse<Meal>>(format(backendRoutes.MEAL, mealID));
}

export async function getMeals(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<Meal>>> {
  return client.get<QueryFilteredResult<Meal>>(backendRoutes.MEALS, { params: filter.asRecord() });
}

export async function updateMeal(
  client: Axios,
  mealID: string,
  input: MealUpdateRequestInput,
): Promise<AxiosResponse<APIResponse<Meal>>> {
  return client.put<APIResponse<Meal>>(format(backendRoutes.MEAL, mealID), input);
}

export async function deleteMeal(client: Axios, mealID: string): Promise<AxiosResponse<APIResponse<Meal>>> {
  return client.delete(format(backendRoutes.MEAL, mealID));
}

export async function searchForMeals(client: Axios, query: string): Promise<AxiosResponse<QueryFilteredResult<Meal>>> {
  const searchURL = `${backendRoutes.MEALS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<QueryFilteredResult<Meal>>(searchURL);
}
