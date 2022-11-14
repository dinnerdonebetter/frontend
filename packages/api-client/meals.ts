import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import { MealCreationRequestInput, Meal, MealList, MealUpdateRequestInput, QueryFilter } from '@prixfixeco/models';
import { backendRoutes } from './routes';

export async function createMeal(client: Axios, input: MealCreationRequestInput): Promise<AxiosResponse<Meal>> {
  return client.post<Meal>(backendRoutes.MEALS, input);
}

export async function getMeal(client: Axios, mealID: string): Promise<AxiosResponse<Meal>> {
  return client.get<Meal>(format(backendRoutes.MEAL, mealID));
}

export async function getMeals(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<MealList>> {
  return client.get<MealList>(backendRoutes.MEALS, { params: filter.asRecord() });
}

export async function updateMeal(
  client: Axios,
  mealID: string,
  input: MealUpdateRequestInput,
): Promise<AxiosResponse<Meal>> {
  return client.put<Meal>(format(backendRoutes.MEAL, mealID), input);
}

export async function deleteMeal(client: Axios, mealID: string): Promise<AxiosResponse<Meal>> {
  return client.delete(format(backendRoutes.MEAL, mealID));
}

export async function searchForMeals(client: Axios, query: string): Promise<AxiosResponse<MealList>> {
  const searchURL = `${backendRoutes.MEALS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<MealList>(searchURL);
}
