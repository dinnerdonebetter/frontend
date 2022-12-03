import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import { MealPlanTask, MealPlanTaskStatusChangeRequestInput } from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function getMealPlanTask(
  client: Axios,
  mealPlanID: string,
  mealPlanTaskID: string,
): Promise<AxiosResponse<MealPlanTask>> {
  return client.get<MealPlanTask>(format(backendRoutes.MEAL_PLAN_TASKS, mealPlanID, mealPlanTaskID));
}

export async function getMealPlanTasks(client: Axios, mealPlanID: string): Promise<AxiosResponse<MealPlanTask[]>> {
  return client.get<MealPlanTask[]>(format(backendRoutes.MEAL_PLAN_TASKS, mealPlanID));
}

export async function updateMealPlanTaskStatus(
  client: Axios,
  mealPlanID: string,
  mealPlanTaskID: string,
  input: MealPlanTaskStatusChangeRequestInput,
): Promise<AxiosResponse<MealPlanTask>> {
  return client.patch<MealPlanTask>(format(backendRoutes.MEAL_PLAN_TASK, mealPlanID, mealPlanTaskID), input);
}
