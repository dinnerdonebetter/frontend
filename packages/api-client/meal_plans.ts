import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  MealPlanCreationRequestInput,
  MealPlan,
  QueryFilter,
  MealPlanList,
  MealPlanUpdateRequestInput,
  MealPlanOptionVoteCreationRequestInput,
  MealPlanOptionVote,
} from '@prixfixeco/models';
import { backendRoutes } from './routes';

export async function createMealPlan(
  client: Axios,
  input: MealPlanCreationRequestInput,
): Promise<AxiosResponse<MealPlan>> {
  return client.post<MealPlan>(backendRoutes.MEAL_PLANS, input);
}

export async function getMealPlan(client: Axios, mealPlanID: string): Promise<AxiosResponse<MealPlan>> {
  return client.get<MealPlan>(format(backendRoutes.MEAL_PLAN, mealPlanID));
}

export async function getMealPlans(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<MealPlanList>> {
  return client.get<MealPlanList>(backendRoutes.MEAL_PLANS, { params: filter.asRecord() });
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
