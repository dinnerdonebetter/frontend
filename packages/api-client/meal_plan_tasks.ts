import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import { APIResponse, MealPlanTask, MealPlanTaskStatusChangeRequestInput } from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getMealPlanTask(
  client: Axios,
  mealPlanID: string,
  mealPlanTaskID: string,
): Promise<AxiosResponse<APIResponse<MealPlanTask>>> {
  return client.get<APIResponse<MealPlanTask>>(format(backendRoutes.MEAL_PLAN_TASKS, mealPlanID, mealPlanTaskID));
}

export async function getMealPlanTasks(client: Axios, mealPlanID: string): Promise<AxiosResponse<MealPlanTask[]>> {
  return client.get<MealPlanTask[]>(format(backendRoutes.MEAL_PLAN_TASKS, mealPlanID));
}

export async function updateMealPlanTaskStatus(
  client: Axios,
  mealPlanID: string,
  mealPlanTaskID: string,
  input: MealPlanTaskStatusChangeRequestInput,
): Promise<AxiosResponse<APIResponse<MealPlanTask>>> {
  return client.patch<APIResponse<MealPlanTask>>(
    format(backendRoutes.MEAL_PLAN_TASK, mealPlanID, mealPlanTaskID),
    input,
  );
}
