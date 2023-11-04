import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  MealPlanCreationRequestInput,
  MealPlan,
  QueryFilter,
  MealPlanUpdateRequestInput,
  MealPlanOptionVoteCreationRequestInput,
  MealPlanOptionVote,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createMealPlan(client: Axios, input: MealPlanCreationRequestInput): Promise<MealPlan> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<MealPlan>>(backendRoutes.MEAL_PLANS, input);

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getMealPlan(client: Axios, mealPlanID: string): Promise<MealPlan> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<MealPlan>>(format(backendRoutes.MEAL_PLAN, mealPlanID));

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function getMealPlans(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<MealPlan>>> {
  return client.get<QueryFilteredResult<MealPlan>>(backendRoutes.MEAL_PLANS, { params: filter.asRecord() });
}

export async function updateMealPlan(
  client: Axios,
  mealPlanID: string,
  input: MealPlanUpdateRequestInput,
): Promise<AxiosResponse<MealPlan>> {
  return client.put<MealPlan>(format(backendRoutes.MEAL_PLAN, mealPlanID), input);
}

export async function deleteMealPlan(client: Axios, mealPlanID: string): Promise<AxiosResponse<MealPlan>> {
  return client.delete(format(backendRoutes.MEAL_PLAN, mealPlanID));
}

export async function voteForMealPlan(
  client: Axios,
  mealPlanID: string,
  mealPlanEventID: string,
  votes: MealPlanOptionVoteCreationRequestInput,
): Promise<AxiosResponse<Array<MealPlanOptionVote>>> {
  return client.post<Array<MealPlanOptionVote>>(
    format(backendRoutes.MEAL_PLAN_VOTING, mealPlanID, mealPlanEventID),
    votes,
  );
}
