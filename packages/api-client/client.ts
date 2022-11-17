import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import { createMeal, getMeal, getMeals, updateMeal, deleteMeal, searchForMeals } from './meals';
import {
  createValidPreparation,
  getValidPreparation,
  getValidPreparations,
  updateValidPreparation,
  deleteValidPreparation,
  searchForValidPreparations,
} from './valid_preparations';

import {
  validPreparationInstrumentsForPreparationID,
  validPreparationInstrumentsForInstrumentID,
  createValidPreparationInstrument,
  deleteValidPreparationInstrument,
} from './valid_preparation_instruments';
import {
  createValidMeasurementUnit,
  getValidMeasurementUnit,
  getValidMeasurementUnits,
  updateValidMeasurementUnit,
  deleteValidMeasurementUnit,
  searchForValidMeasurementUnits,
} from './valid_measurement_units';
import {
  createValidInstrument,
  getValidInstrument,
  getValidInstruments,
  updateValidInstrument,
  deleteValidInstrument,
  searchForValidInstruments,
} from './valid_instruments';
import {
  createValidIngredient,
  getValidIngredient,
  getValidIngredients,
  updateValidIngredient,
  deleteValidIngredient,
  searchForValidIngredients,
} from './valid_ingredients';
import {
  logIn,
  adminLogin,
  logOut,
  register,
  checkPermissions,
  requestPasswordResetToken,
  redeemPasswordResetToken,
  requestUsernameReminderEmail,
} from './auth';
import { getInvitation, acceptInvitation, cancelInvitation, rejectInvitation } from './household_invitations';
import {
  inviteUserToHousehold,
  removeMemberFromHousehold,
  getReceivedInvites,
  getSentInvites,
  getCurrentHouseholdInfo,
  getHousehold,
  getHouseholds,
  updateHousehold,
} from './households';
import { clientName } from './constants';
import {
  createMealPlan,
  getMealPlan,
  getMealPlans,
  updateMealPlan,
  deleteMealPlan,
  voteForMealPlan,
} from './meal_plans';
import { createRecipe, getRecipe, getRecipes, updateRecipe, deleteRecipe, searchForRecipes } from './recipes';
import { getUser, getUsers, updateUserAccountStatus, searchForUsers, fetchSelf } from './users';
import {
  validIngredientMeasurementUnitsForMeasurementUnitID,
  createValidIngredientMeasurementUnit,
  deleteValidIngredientMeasurementUnit,
  validIngredientMeasurementUnitsForIngredientID,
} from './valid_ingredient_measurement_units';
import {
  validIngredientPreparationsForPreparationID,
  validIngredientPreparationsForIngredientID,
  createValidIngredientPreparation,
  deleteValidIngredientPreparation,
} from './valid_ingredient_preparations';
import { getMealPlanTask, getMealPlanTasks, updateMealPlanTaskStatus } from './meal_plan_tasks';

import {
  MealPlanTask,
  MealPlanTaskStatusChangeRequestInput,
  Household,
  HouseholdInvitationCreationRequestInput,
  HouseholdInvitationList,
  HouseholdInvitationUpdateRequestInput,
  HouseholdList,
  HouseholdUpdateRequestInput,
  Meal,
  MealCreationRequestInput,
  MealList,
  MealPlan,
  MealPlanCreationRequestInput,
  MealPlanList,
  MealPlanOptionVote,
  MealPlanOptionVoteCreationRequestInput,
  MealPlanUpdateRequestInput,
  MealUpdateRequestInput,
  PasswordResetTokenCreationRequestInput,
  PasswordResetTokenRedemptionRequestInput,
  QueryFilter,
  Recipe,
  RecipeCreationRequestInput,
  RecipeList,
  RecipeUpdateRequestInput,
  User,
  UserRegistrationResponse,
  UserAccountStatusUpdateInput,
  UserList,
  UserLoginInput,
  UsernameReminderRequestInput,
  UserPermissionsRequestInput,
  UserPermissionsResponse,
  UserRegistrationInput,
  UserStatusResponse,
  ValidIngredient,
  ValidIngredientCreationRequestInput,
  ValidIngredientList,
  ValidIngredientMeasurementUnit,
  ValidIngredientMeasurementUnitCreationRequestInput,
  ValidIngredientMeasurementUnitList,
  ValidIngredientPreparation,
  ValidIngredientPreparationCreationRequestInput,
  ValidIngredientPreparationList,
  ValidIngredientUpdateRequestInput,
  ValidInstrument,
  ValidInstrumentCreationRequestInput,
  ValidInstrumentList,
  ValidInstrumentUpdateRequestInput,
  ValidMeasurementUnit,
  ValidMeasurementUnitCreationRequestInput,
  ValidMeasurementUnitList,
  ValidMeasurementUnitUpdateRequestInput,
  ValidPreparation,
  ValidPreparationCreationRequestInput,
  ValidPreparationInstrument,
  ValidPreparationInstrumentCreationRequestInput,
  ValidPreparationInstrumentList,
  ValidPreparationList,
  ValidPreparationUpdateRequestInput,
  HouseholdInvitation,
  MealPlanGroceryListItem,
  MealPlanGroceryListItemCreationRequestInput,
  MealPlanGroceryListItemUpdateRequestInput,
} from '@prixfixeco/models';
import {
  createMealPlanGroceryListItem,
  getMealPlanGroceryListItem,
  getMealPlanGroceryListItems,
  updateMealPlanGroceryListItem,
  deleteMealPlanGroceryListItem,
} from './meal_plan_grocery_list_items';

const cookieName = 'prixfixecookie';

export class PrixFixeAPIClient {
  baseURL: string;
  client: AxiosInstance;

  constructor(baseURL: string, cookie?: string) {
    // if (baseURL === '') {
    //   throw new Error('baseURL cannot be empty');
    // }

    this.baseURL = baseURL;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Source': 'webapp',
      'X-Service-Client': clientName,
    };

    if (cookie) {
      headers['Cookie'] = `${cookieName}=${cookie}`;
    }

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
      crossDomain: true,
      headers,
    } as AxiosRequestConfig);

    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error.message);
      },
    );
  }

  configureRouterRejectionInterceptor(redirectCallback: (loc: Location) => void) {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        console.debug(`Request failed: ${error.response?.status}`);
        if (error.response?.status === 401) {
          redirectCallback(window.location);
        }

        return Promise.reject(error);
      },
    );
  }

  // auth

  async logIn(input: UserLoginInput): Promise<AxiosResponse<UserStatusResponse>> {
    return logIn(this.client, input);
  }

  async adminLogin(input: UserLoginInput): Promise<AxiosResponse<UserStatusResponse>> {
    return adminLogin(this.client, input);
  }

  async logOut(): Promise<AxiosResponse<UserStatusResponse>> {
    return logOut(this.client);
  }

  async register(input: UserRegistrationInput): Promise<AxiosResponse<UserRegistrationResponse>> {
    return register(this.client, input);
  }

  async checkPermissions(body: UserPermissionsRequestInput): Promise<AxiosResponse<UserPermissionsResponse>> {
    return checkPermissions(this.client, body);
  }

  async requestPasswordResetToken(input: PasswordResetTokenCreationRequestInput): Promise<AxiosResponse> {
    return requestPasswordResetToken(this.client, input);
  }

  async redeemPasswordResetToken(input: PasswordResetTokenRedemptionRequestInput): Promise<AxiosResponse> {
    return redeemPasswordResetToken(this.client, input);
  }

  async requestUsernameReminderEmail(input: UsernameReminderRequestInput): Promise<AxiosResponse> {
    return requestUsernameReminderEmail(this.client, input);
  }

  // household invitations

  async getInvitation(invitationID: string): Promise<AxiosResponse> {
    return getInvitation(this.client, invitationID);
  }

  async acceptInvitation(invitationID: string, input: HouseholdInvitationUpdateRequestInput): Promise<AxiosResponse> {
    return acceptInvitation(this.client, invitationID, input);
  }

  async cancelInvitation(invitationID: string, input: HouseholdInvitationUpdateRequestInput): Promise<AxiosResponse> {
    return cancelInvitation(this.client, invitationID, input);
  }

  async rejectInvitation(invitationID: string, input: HouseholdInvitationUpdateRequestInput): Promise<AxiosResponse> {
    return rejectInvitation(this.client, invitationID, input);
  }

  // households

  async getCurrentHouseholdInfo(): Promise<AxiosResponse<Household>> {
    return getCurrentHouseholdInfo(this.client);
  }

  async getHousehold(id: string): Promise<AxiosResponse<Household>> {
    return getHousehold(this.client, id);
  }

  async getHouseholds(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<HouseholdList>> {
    return getHouseholds(this.client, filter);
  }

  async updateHousehold(
    householdID: string,
    household: HouseholdUpdateRequestInput,
  ): Promise<AxiosResponse<Household>> {
    return updateHousehold(this.client, householdID, household);
  }

  async inviteUserToHousehold(
    householdID: string,
    input: HouseholdInvitationCreationRequestInput,
  ): Promise<AxiosResponse<HouseholdInvitation>> {
    return inviteUserToHousehold(this.client, householdID, input);
  }

  async removeMemberFromHousehold(householdID: string, memberID: string): Promise<AxiosResponse> {
    return removeMemberFromHousehold(this.client, householdID, memberID);
  }

  async getReceivedInvites(): Promise<AxiosResponse<HouseholdInvitationList>> {
    return getReceivedInvites(this.client);
  }

  async getSentInvites(): Promise<AxiosResponse<HouseholdInvitationList>> {
    return getSentInvites(this.client);
  }

  // meal plans

  async createMealPlan(input: MealPlanCreationRequestInput): Promise<AxiosResponse<MealPlan>> {
    return createMealPlan(this.client, input);
  }

  async getMealPlan(mealPlanID: string): Promise<AxiosResponse<MealPlan>> {
    return getMealPlan(this.client, mealPlanID);
  }

  async getMealPlans(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<MealPlanList>> {
    return getMealPlans(this.client, filter);
  }

  async updateMealPlan(mealPlanID: string, input: MealPlanUpdateRequestInput): Promise<AxiosResponse<MealPlan>> {
    return updateMealPlan(this.client, mealPlanID, input);
  }

  async deleteMealPlan(mealPlanID: string): Promise<AxiosResponse<MealPlan>> {
    return deleteMealPlan(this.client, mealPlanID);
  }

  async voteForMealPlan(
    mealPlanID: string,
    mealPlanEventID: string,
    votes: MealPlanOptionVoteCreationRequestInput,
  ): Promise<AxiosResponse<Array<MealPlanOptionVote>>> {
    return voteForMealPlan(this.client, mealPlanID, mealPlanEventID, votes);
  }

  // meals

  async createMeal(input: MealCreationRequestInput): Promise<AxiosResponse<Meal>> {
    return createMeal(this.client, input);
  }

  async getMeal(mealID: string): Promise<AxiosResponse<Meal>> {
    return getMeal(this.client, mealID);
  }

  async getMeals(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<MealList>> {
    return getMeals(this.client, filter);
  }

  async updateMeal(mealID: string, input: MealUpdateRequestInput): Promise<AxiosResponse<Meal>> {
    return updateMeal(this.client, mealID, input);
  }

  async deleteMeal(mealID: string): Promise<AxiosResponse<Meal>> {
    return deleteMeal(this.client, mealID);
  }

  async searchForMeals(query: string): Promise<AxiosResponse<MealList>> {
    return searchForMeals(this.client, query);
  }

  // recipes

  async createRecipe(input: RecipeCreationRequestInput): Promise<AxiosResponse<Recipe>> {
    return createRecipe(this.client, input);
  }

  async getRecipe(recipeID: string): Promise<AxiosResponse<Recipe>> {
    return getRecipe(this.client, recipeID);
  }

  async getRecipes(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<RecipeList>> {
    return getRecipes(this.client, filter);
  }

  async updateRecipe(recipeID: string, input: RecipeUpdateRequestInput): Promise<AxiosResponse<Recipe>> {
    return updateRecipe(this.client, recipeID, input);
  }

  async deleteRecipe(recipeID: string): Promise<AxiosResponse> {
    return deleteRecipe(this.client, recipeID);
  }

  async searchForRecipes(query: string): Promise<AxiosResponse<RecipeList>> {
    return searchForRecipes(this.client, query);
  }

  // users
  async self(): Promise<AxiosResponse<User>> {
    return fetchSelf(this.client);
  }

  async getUser(userID: string): Promise<AxiosResponse<User>> {
    return getUser(this.client, userID);
  }

  async getUsers(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<UserList>> {
    return getUsers(this.client, filter);
  }

  async updateUserAccountStatus(input: UserAccountStatusUpdateInput): Promise<AxiosResponse> {
    return updateUserAccountStatus(this.client, input);
  }

  async searchForUsers(query: string): Promise<AxiosResponse<User[]>> {
    return searchForUsers(this.client, query);
  }

  // valid ingredient measurement units

  async validIngredientMeasurementUnitsForIngredientID(
    validIngredientID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidIngredientMeasurementUnitList>> {
    return validIngredientMeasurementUnitsForIngredientID(this.client, validIngredientID, filter);
  }

  async validIngredientMeasurementUnitsForMeasurementUnitID(
    validMeasurementUnitID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidIngredientMeasurementUnitList>> {
    return validIngredientMeasurementUnitsForMeasurementUnitID(this.client, validMeasurementUnitID, filter);
  }

  async createValidIngredientMeasurementUnit(
    input: ValidIngredientMeasurementUnitCreationRequestInput,
  ): Promise<AxiosResponse<ValidIngredientMeasurementUnit>> {
    return createValidIngredientMeasurementUnit(this.client, input);
  }

  async deleteValidIngredientMeasurementUnit(
    validIngredientMeasurementUnitID: string,
  ): Promise<AxiosResponse<ValidIngredientMeasurementUnit>> {
    return deleteValidIngredientMeasurementUnit(this.client, validIngredientMeasurementUnitID);
  }

  // valid ingredient preparations

  async validIngredientPreparationsForPreparationID(
    validPreparationID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidIngredientPreparationList>> {
    return validIngredientPreparationsForPreparationID(this.client, validPreparationID, filter);
  }

  async validIngredientPreparationsForIngredientID(
    validIngredientID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidIngredientPreparationList>> {
    return validIngredientPreparationsForIngredientID(this.client, validIngredientID, filter);
  }

  async createValidIngredientPreparation(
    input: ValidIngredientPreparationCreationRequestInput,
  ): Promise<AxiosResponse<ValidIngredientPreparation>> {
    return createValidIngredientPreparation(this.client, input);
  }

  async deleteValidIngredientPreparation(validIngredientPreparationID: string): Promise<AxiosResponse> {
    return deleteValidIngredientPreparation(this.client, validIngredientPreparationID);
  }

  // valid ingredients
  async createValidIngredient(input: ValidIngredientCreationRequestInput): Promise<AxiosResponse<ValidIngredient>> {
    return createValidIngredient(this.client, input);
  }

  async getValidIngredient(validIngredientID: string): Promise<AxiosResponse<ValidIngredient>> {
    return getValidIngredient(this.client, validIngredientID);
  }

  async getValidIngredients(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<ValidIngredientList>> {
    return getValidIngredients(this.client, filter);
  }

  async updateValidIngredient(
    validIngredientID: string,
    input: ValidIngredientUpdateRequestInput,
  ): Promise<AxiosResponse<ValidIngredient>> {
    return updateValidIngredient(this.client, validIngredientID, input);
  }

  async deleteValidIngredient(validIngredientID: string): Promise<AxiosResponse<ValidIngredient>> {
    return deleteValidIngredient(this.client, validIngredientID);
  }

  async searchForValidIngredients(query: string): Promise<AxiosResponse<ValidIngredient[]>> {
    return searchForValidIngredients(this.client, query);
  }

  // valid instruments
  async createValidInstrument(input: ValidInstrumentCreationRequestInput): Promise<AxiosResponse<ValidInstrument>> {
    return createValidInstrument(this.client, input);
  }

  async getValidInstrument(validInstrumentID: string): Promise<AxiosResponse<ValidInstrument>> {
    return getValidInstrument(this.client, validInstrumentID);
  }

  async getValidInstruments(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<ValidInstrumentList>> {
    return getValidInstruments(this.client, filter);
  }

  async updateValidInstrument(
    validInstrumentID: string,
    input: ValidInstrumentUpdateRequestInput,
  ): Promise<AxiosResponse<ValidInstrument>> {
    return updateValidInstrument(this.client, validInstrumentID, input);
  }

  async deleteValidInstrument(validInstrumentID: string): Promise<AxiosResponse<ValidInstrument>> {
    return deleteValidInstrument(this.client, validInstrumentID);
  }

  async searchForValidInstruments(query: string): Promise<AxiosResponse<ValidInstrument[]>> {
    return searchForValidInstruments(this.client, query);
  }

  // valid measurement units
  async createValidMeasurementUnit(
    input: ValidMeasurementUnitCreationRequestInput,
  ): Promise<AxiosResponse<ValidMeasurementUnit>> {
    return createValidMeasurementUnit(this.client, input);
  }

  async getValidMeasurementUnit(validMeasurementUnitID: string): Promise<AxiosResponse<ValidMeasurementUnit>> {
    return getValidMeasurementUnit(this.client, validMeasurementUnitID);
  }

  async getValidMeasurementUnits(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidMeasurementUnitList>> {
    return getValidMeasurementUnits(this.client, filter);
  }

  async updateValidMeasurementUnit(
    validMeasurementUnitID: string,
    input: ValidMeasurementUnitUpdateRequestInput,
  ): Promise<AxiosResponse<ValidMeasurementUnit>> {
    return updateValidMeasurementUnit(this.client, validMeasurementUnitID, input);
  }

  async deleteValidMeasurementUnit(validMeasurementUnitID: string): Promise<AxiosResponse<ValidMeasurementUnit>> {
    return deleteValidMeasurementUnit(this.client, validMeasurementUnitID);
  }

  async searchForValidMeasurementUnits(query: string): Promise<AxiosResponse<ValidMeasurementUnit[]>> {
    return searchForValidMeasurementUnits(this.client, query);
  }

  // valid preparation instruments
  async validPreparationInstrumentsForPreparationID(
    validPreparationID: string,
  ): Promise<AxiosResponse<ValidPreparationInstrumentList>> {
    return validPreparationInstrumentsForPreparationID(this.client, validPreparationID);
  }

  async validPreparationInstrumentsForInstrumentID(
    validInstrumentID: string,
  ): Promise<AxiosResponse<ValidPreparationInstrumentList>> {
    return validPreparationInstrumentsForInstrumentID(this.client, validInstrumentID);
  }

  async createValidPreparationInstrument(
    input: ValidPreparationInstrumentCreationRequestInput,
  ): Promise<AxiosResponse<ValidPreparationInstrument>> {
    return createValidPreparationInstrument(this.client, input);
  }

  async deleteValidPreparationInstrument(validPreparationInstrumentID: string): Promise<AxiosResponse> {
    return deleteValidPreparationInstrument(this.client, validPreparationInstrumentID);
  }

  // valid preparations
  async createValidPreparation(input: ValidPreparationCreationRequestInput): Promise<AxiosResponse<ValidPreparation>> {
    return createValidPreparation(this.client, input);
  }

  async getValidPreparation(validPreparationID: string): Promise<AxiosResponse<ValidPreparation>> {
    return getValidPreparation(this.client, validPreparationID);
  }

  async getValidPreparations(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidPreparationList>> {
    return getValidPreparations(this.client, filter);
  }

  async updateValidPreparation(
    validPreparationID: string,
    input: ValidPreparationUpdateRequestInput,
  ): Promise<AxiosResponse<ValidPreparation>> {
    return updateValidPreparation(this.client, validPreparationID, input);
  }

  async deleteValidPreparation(validPreparationID: string): Promise<AxiosResponse<ValidPreparation>> {
    return deleteValidPreparation(this.client, validPreparationID);
  }

  async searchForValidPreparations(query: string): Promise<AxiosResponse<ValidPreparation[]>> {
    return searchForValidPreparations(this.client, query);
  }

  // meal plan tasks

  async getMealPlanTask(mealPlanID: string, mealPlanTaskID: string): Promise<AxiosResponse<MealPlanTask>> {
    return getMealPlanTask(this.client, mealPlanID, mealPlanTaskID);
  }

  async getMealPlanTasks(mealPlanID: string): Promise<AxiosResponse<MealPlanTask[]>> {
    return getMealPlanTasks(this.client, mealPlanID);
  }

  async updateMealPlanTaskStatus(
    mealPlanID: string,
    mealPlanTaskID: string,
    input: MealPlanTaskStatusChangeRequestInput,
  ): Promise<AxiosResponse<MealPlanTask>> {
    return updateMealPlanTaskStatus(this.client, mealPlanID, mealPlanTaskID, input);
  }

  async createMealPlanGroceryListItem(
    mealPlanID: string,
    input: MealPlanGroceryListItemCreationRequestInput,
  ): Promise<AxiosResponse<MealPlanGroceryListItem>> {
    return createMealPlanGroceryListItem(this.client, mealPlanID, input);
  }

  async getMealPlanGroceryListItem(mealPlanID: string): Promise<AxiosResponse<MealPlanGroceryListItem>> {
    return getMealPlanGroceryListItem(this.client, mealPlanID);
  }

  async getMealPlanGroceryListItems(mealPlanID: string): Promise<AxiosResponse<MealPlanGroceryListItem[]>> {
    return getMealPlanGroceryListItems(this.client, mealPlanID);
  }

  async updateMealPlanGroceryListItem(
    mealPlanID: string,
    input: MealPlanGroceryListItemUpdateRequestInput,
  ): Promise<AxiosResponse<MealPlanGroceryListItem>> {
    return updateMealPlanGroceryListItem(this.client, mealPlanID, input);
  }

  async deleteMealPlanGroceryListItem(mealPlanID: string): Promise<AxiosResponse<MealPlanGroceryListItem>> {
    return deleteMealPlanGroceryListItem(this.client, mealPlanID);
  }
}
