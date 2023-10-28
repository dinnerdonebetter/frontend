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

export async function createMealPlan(
  client: Axios,
  input: MealPlanCreationRequestInput,
): Promise<AxiosResponse<APIResponse<MealPlan>>> {
  return client.post<APIResponse<MealPlan>>(backendRoutes.MEAL_PLANS, input);
}

export async function getMealPlan(client: Axios, mealPlanID: string): Promise<AxiosResponse<APIResponse<MealPlan>>> {
  return client.get<APIResponse<MealPlan>>(format(backendRoutes.MEAL_PLAN, mealPlanID));
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
): Promise<AxiosResponse<APIResponse<MealPlan>>> {
  return client.put<APIResponse<MealPlan>>(format(backendRoutes.MEAL_PLAN, mealPlanID), input);
}

export async function deleteMealPlan(client: Axios, mealPlanID: string): Promise<AxiosResponse<APIResponse<MealPlan>>> {
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
