import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  MealPlanGroceryListItemCreationRequestInput,
  MealPlanGroceryListItem,
  MealPlanGroceryListItemUpdateRequestInput,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function createMealPlanGroceryListItem(
  client: Axios,
  mealPlanID: string,
  input: MealPlanGroceryListItemCreationRequestInput,
): Promise<AxiosResponse<MealPlanGroceryListItem>> {
  return client.post<MealPlanGroceryListItem>(format(backendRoutes.MEAL_PLAN_GROCERY_LIST_ITEMS, mealPlanID), input);
}

export async function getMealPlanGroceryListItem(
  client: Axios,
  mealPlanID: string,
): Promise<AxiosResponse<MealPlanGroceryListItem>> {
  return client.get<MealPlanGroceryListItem>(format(backendRoutes.MEAL_PLAN_GROCERY_LIST_ITEM, mealPlanID));
}

export async function getMealPlanGroceryListItems(
  client: Axios,
  mealPlanID: string,
): Promise<AxiosResponse<MealPlanGroceryListItem[]>> {
  return client.get<MealPlanGroceryListItem[]>(format(backendRoutes.MEAL_PLAN_GROCERY_LIST_ITEMS, mealPlanID));
}

export async function updateMealPlanGroceryListItem(
  client: Axios,
  mealPlanID: string,
  mealPlanGroceryListItemID: string,
  input: MealPlanGroceryListItemUpdateRequestInput,
): Promise<AxiosResponse<MealPlanGroceryListItem>> {
  return client.put<MealPlanGroceryListItem>(
    format(backendRoutes.MEAL_PLAN_GROCERY_LIST_ITEM, mealPlanID, mealPlanGroceryListItemID),
    input,
  );
}

export async function deleteMealPlanGroceryListItem(
  client: Axios,
  mealPlanID: string,
  mealPlanGroceryListItemID: string,
): Promise<AxiosResponse<MealPlanGroceryListItem>> {
  return client.delete(format(backendRoutes.MEAL_PLAN_GROCERY_LIST_ITEM, mealPlanID, mealPlanGroceryListItemID));
}
