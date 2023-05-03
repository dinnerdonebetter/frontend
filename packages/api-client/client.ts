import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { buildServerSideLogger } from '@prixfixeco/logger';

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
  createServiceSetting,
  getServiceSetting,
  getServiceSettings,
  updateServiceSetting,
  deleteServiceSetting,
  searchForServiceSettings,
} from './service_settings';
import {
  createServiceSettingConfiguration,
  getServiceSettingConfigurationsForUser,
  getServiceSettingConfigurationsForHousehold,
  updateServiceSettingConfiguration,
  deleteServiceSettingConfiguration,
} from './service_setting_configurations';

import {
  validPreparationInstrumentsForPreparationID,
  validPreparationInstrumentsForInstrumentID,
  createValidPreparationInstrument,
  deleteValidPreparationInstrument,
  getValidPreparationInstrument,
} from './valid_preparation_instruments';
import {
  createValidMeasurementUnit,
  getValidMeasurementUnit,
  getValidMeasurementUnits,
  updateValidMeasurementUnit,
  deleteValidMeasurementUnit,
  searchForValidMeasurementUnits,
  searchForValidMeasurementUnitsByIngredientID,
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
  getValidIngredientsForPreparation,
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
import { getUser, getUsers, updateUserAccountStatus, searchForUsers, verifyEmailAddress, fetchSelf } from './users';
import {
  validIngredientMeasurementUnitsForMeasurementUnitID,
  createValidIngredientMeasurementUnit,
  deleteValidIngredientMeasurementUnit,
  validIngredientMeasurementUnitsForIngredientID,
  getValidIngredientMeasurementUnit,
} from './valid_ingredient_measurement_units';
import {
  validIngredientPreparationsForPreparationID,
  validIngredientPreparationsForIngredientID,
  createValidIngredientPreparation,
  deleteValidIngredientPreparation,
  getValidIngredientPreparation,
} from './valid_ingredient_preparations';
import { getMealPlanTask, getMealPlanTasks, updateMealPlanTaskStatus } from './meal_plan_tasks';

import {
  MealPlanTask,
  MealPlanTaskStatusChangeRequestInput,
  Household,
  HouseholdInvitationCreationRequestInput,
  HouseholdInvitationUpdateRequestInput,
  HouseholdUpdateRequestInput,
  Meal,
  MealCreationRequestInput,
  MealPlan,
  MealPlanCreationRequestInput,
  MealPlanOptionVote,
  MealPlanOptionVoteCreationRequestInput,
  MealPlanUpdateRequestInput,
  MealUpdateRequestInput,
  PasswordResetTokenCreationRequestInput,
  PasswordResetTokenRedemptionRequestInput,
  QueryFilter,
  Recipe,
  RecipeCreationRequestInput,
  RecipeUpdateRequestInput,
  User,
  UserCreationResponse,
  UserAccountStatusUpdateInput,
  UserLoginInput,
  UsernameReminderRequestInput,
  UserPermissionsRequestInput,
  UserPermissionsResponse,
  UserRegistrationInput,
  UserStatusResponse,
  ValidIngredient,
  ValidIngredientCreationRequestInput,
  ValidIngredientMeasurementUnit,
  ValidIngredientMeasurementUnitCreationRequestInput,
  ValidIngredientPreparation,
  ValidIngredientPreparationCreationRequestInput,
  ValidIngredientUpdateRequestInput,
  ValidInstrument,
  ValidInstrumentCreationRequestInput,
  ValidInstrumentUpdateRequestInput,
  ValidMeasurementUnit,
  ValidMeasurementUnitCreationRequestInput,
  ValidMeasurementUnitUpdateRequestInput,
  ValidPreparation,
  ValidPreparationCreationRequestInput,
  ValidPreparationInstrument,
  ValidPreparationInstrumentCreationRequestInput,
  ValidPreparationUpdateRequestInput,
  HouseholdInvitation,
  MealPlanGroceryListItem,
  MealPlanGroceryListItemCreationRequestInput,
  MealPlanGroceryListItemUpdateRequestInput,
  ValidIngredientState,
  ValidIngredientStateCreationRequestInput,
  ValidIngredientStateUpdateRequestInput,
  ValidMeasurementUnitConversion,
  ValidMeasurementUnitConversionCreationRequestInput,
  ValidMeasurementUnitConversionUpdateRequestInput,
  ValidIngredientStateIngredient,
  ValidIngredientStateIngredientCreationRequestInput,
  QueryFilteredResult,
  ServiceSetting,
  ServiceSettingUpdateRequestInput,
  ServiceSettingCreationRequestInput,
  ServiceSettingConfigurationCreationRequestInput,
  ServiceSettingConfiguration,
  ServiceSettingConfigurationUpdateRequestInput,
  EmailAddressVerificationRequestInput,
} from '@prixfixeco/models';
import {
  createMealPlanGroceryListItem,
  getMealPlanGroceryListItem,
  getMealPlanGroceryListItems,
  updateMealPlanGroceryListItem,
  deleteMealPlanGroceryListItem,
} from './meal_plan_grocery_list_items';
import {
  createValidIngredientState,
  getValidIngredientState,
  getValidIngredientStates,
  updateValidIngredientState,
  deleteValidIngredientState,
  searchForValidIngredientStates,
} from './valid_ingredient_states';
import {
  createValidMeasurementUnitConversion,
  getValidMeasurementUnitConversion,
  getValidMeasurementUnitConversions,
  updateValidMeasurementUnitConversion,
  deleteValidMeasurementUnitConversion,
  getValidMeasurementUnitConversionsFromUnit,
  getValidMeasurementUnitConversionsToUnit,
} from './valid_measurement_unit_conversions';
import {
  validIngredientStateIngredientsForIngredientStateID,
  validIngredientStateIngredientsForIngredientID,
  createValidIngredientStateIngredient,
  deleteValidIngredientStateIngredient,
  getValidIngredientStateIngredient,
} from './valid_ingredient_state_ingredients';
import { backendRoutes } from './routes';

const cookieName = 'prixfixecookie';

const logger = buildServerSideLogger('api_client');

export class PrixFixeAPIClient {
  baseURL: string;
  client: AxiosInstance;

  constructor(baseURL: string = '', cookie?: string) {
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

    this.client.interceptors.request.use((request) => {
      logger.debug(`Request: ${request.method} ${request.url}`);
      return request;
    });

    this.client.interceptors.response.use((response) => {
      logger.debug(`Request: ${response.status}`);
      return response;
    });
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

  async register(input: UserRegistrationInput): Promise<AxiosResponse<UserCreationResponse>> {
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

  async getHouseholds(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<Household>>> {
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

  async getReceivedInvites(): Promise<AxiosResponse<QueryFilteredResult<HouseholdInvitation>>> {
    return getReceivedInvites(this.client);
  }

  async getSentInvites(): Promise<AxiosResponse<QueryFilteredResult<HouseholdInvitation>>> {
    return getSentInvites(this.client);
  }

  // meal plans

  async createMealPlan(input: MealPlanCreationRequestInput): Promise<AxiosResponse<MealPlan>> {
    return createMealPlan(this.client, input);
  }

  async getMealPlan(mealPlanID: string): Promise<AxiosResponse<MealPlan>> {
    return getMealPlan(this.client, mealPlanID);
  }

  async getMealPlans(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<MealPlan>>> {
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

  async getMeals(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<QueryFilteredResult<Meal>>> {
    return getMeals(this.client, filter);
  }

  async updateMeal(mealID: string, input: MealUpdateRequestInput): Promise<AxiosResponse<Meal>> {
    return updateMeal(this.client, mealID, input);
  }

  async deleteMeal(mealID: string): Promise<AxiosResponse<Meal>> {
    return deleteMeal(this.client, mealID);
  }

  async searchForMeals(query: string): Promise<AxiosResponse<QueryFilteredResult<Meal>>> {
    return searchForMeals(this.client, query);
  }

  // recipes

  async createRecipe(input: RecipeCreationRequestInput): Promise<AxiosResponse<Recipe>> {
    return createRecipe(this.client, input);
  }

  async getRecipe(recipeID: string): Promise<AxiosResponse<Recipe>> {
    return getRecipe(this.client, recipeID);
  }

  async getRecipes(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<QueryFilteredResult<Recipe>>> {
    return getRecipes(this.client, filter);
  }

  async updateRecipe(recipeID: string, input: RecipeUpdateRequestInput): Promise<AxiosResponse<Recipe>> {
    return updateRecipe(this.client, recipeID, input);
  }

  async deleteRecipe(recipeID: string): Promise<AxiosResponse> {
    return deleteRecipe(this.client, recipeID);
  }

  async searchForRecipes(query: string): Promise<AxiosResponse<QueryFilteredResult<Recipe>>> {
    return searchForRecipes(this.client, query);
  }

  // users
  async self(): Promise<AxiosResponse<User>> {
    return fetchSelf(this.client);
  }

  async getUser(userID: string): Promise<AxiosResponse<User>> {
    return getUser(this.client, userID);
  }

  async getUsers(filter: QueryFilter = QueryFilter.Default()): Promise<AxiosResponse<QueryFilteredResult<User>>> {
    return getUsers(this.client, filter);
  }

  async updateUserAccountStatus(input: UserAccountStatusUpdateInput): Promise<AxiosResponse> {
    return updateUserAccountStatus(this.client, input);
  }

  async searchForUsers(query: string): Promise<AxiosResponse<User[]>> {
    return searchForUsers(this.client, query);
  }

  async verifyEmailAddress(input: EmailAddressVerificationRequestInput): Promise<AxiosResponse> {
    return verifyEmailAddress(this.client, input);
  }

  // valid ingredient measurement units

  async getValidIngredientMeasurementUnit(
    validIngredientMeasurementUnitID: string,
  ): Promise<AxiosResponse<ValidIngredientMeasurementUnit>> {
    return getValidIngredientMeasurementUnit(this.client, validIngredientMeasurementUnitID);
  }

  async validIngredientMeasurementUnitsForIngredientID(
    validIngredientID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientMeasurementUnit>>> {
    return validIngredientMeasurementUnitsForIngredientID(this.client, validIngredientID, filter);
  }

  async validIngredientMeasurementUnitsForMeasurementUnitID(
    validMeasurementUnitID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientMeasurementUnit>>> {
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

  async getValidIngredientPreparation(
    validIngredientPreparationID: string,
  ): Promise<AxiosResponse<ValidIngredientPreparation>> {
    return getValidIngredientPreparation(this.client, validIngredientPreparationID);
  }

  async validIngredientPreparationsForPreparationID(
    validPreparationID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientPreparation>>> {
    return validIngredientPreparationsForPreparationID(this.client, validPreparationID, filter);
  }

  async validIngredientPreparationsForIngredientID(
    validIngredientID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientPreparation>>> {
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

  // valid ingredient state ingredients

  async getValidIngredientStateIngredient(
    validIngredientStateID: string,
  ): Promise<AxiosResponse<ValidIngredientStateIngredient>> {
    return getValidIngredientStateIngredient(this.client, validIngredientStateID);
  }

  async validIngredientStateIngredientsForIngredientStateID(
    validIngredientStateID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientStateIngredient>>> {
    return validIngredientStateIngredientsForIngredientStateID(this.client, validIngredientStateID, filter);
  }

  async validIngredientStateIngredientsForIngredientID(
    validIngredientID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientStateIngredient>>> {
    return validIngredientStateIngredientsForIngredientID(this.client, validIngredientID, filter);
  }

  async createValidIngredientStateIngredient(
    input: ValidIngredientStateIngredientCreationRequestInput,
  ): Promise<AxiosResponse<ValidIngredientStateIngredient>> {
    return createValidIngredientStateIngredient(this.client, input);
  }

  async deleteValidIngredientStateIngredient(validIngredientStateIngredientID: string): Promise<AxiosResponse> {
    return deleteValidIngredientStateIngredient(this.client, validIngredientStateIngredientID);
  }

  // valid ingredients
  async createValidIngredient(input: ValidIngredientCreationRequestInput): Promise<AxiosResponse<ValidIngredient>> {
    return createValidIngredient(this.client, input);
  }

  async getValidIngredient(validIngredientID: string): Promise<AxiosResponse<ValidIngredient>> {
    return getValidIngredient(this.client, validIngredientID);
  }

  async getValidIngredients(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredient>>> {
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

  async getValidIngredientsForPreparation(
    validPreparationID: string,
    query: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredient>>> {
    return getValidIngredientsForPreparation(this.client, validPreparationID, query, filter);
  }

  // valid instruments
  async createValidInstrument(input: ValidInstrumentCreationRequestInput): Promise<AxiosResponse<ValidInstrument>> {
    return createValidInstrument(this.client, input);
  }

  async getValidInstrument(validInstrumentID: string): Promise<AxiosResponse<ValidInstrument>> {
    return getValidInstrument(this.client, validInstrumentID);
  }

  async getValidInstruments(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidInstrument>>> {
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
  ): Promise<AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>> {
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

  async searchForValidMeasurementUnitsByIngredientID(
    validIngredientID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidMeasurementUnit>>> {
    return searchForValidMeasurementUnitsByIngredientID(this.client, validIngredientID, filter);
  }

  // valid measurement unit conversions
  async createValidMeasurementUnitConversion(
    input: ValidMeasurementUnitConversionCreationRequestInput,
  ): Promise<AxiosResponse<ValidMeasurementUnitConversion>> {
    return createValidMeasurementUnitConversion(this.client, input);
  }

  async getValidMeasurementUnitConversion(
    validMeasurementUnitID: string,
  ): Promise<AxiosResponse<ValidMeasurementUnitConversion>> {
    return getValidMeasurementUnitConversion(this.client, validMeasurementUnitID);
  }

  async getValidMeasurementUnitConversions(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidMeasurementUnitConversion>>> {
    return getValidMeasurementUnitConversions(this.client, filter);
  }

  async getValidMeasurementUnitConversionsFromUnit(
    validMeasurementUnitID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidMeasurementUnitConversion[]>> {
    return getValidMeasurementUnitConversionsFromUnit(this.client, validMeasurementUnitID, filter);
  }

  async getValidMeasurementUnitConversionsToUnit(
    validMeasurementUnitID: string,
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<ValidMeasurementUnitConversion[]>> {
    return getValidMeasurementUnitConversionsToUnit(this.client, validMeasurementUnitID, filter);
  }

  async updateValidMeasurementUnitConversion(
    validMeasurementUnitID: string,
    input: ValidMeasurementUnitConversionUpdateRequestInput,
  ): Promise<AxiosResponse<ValidMeasurementUnitConversion>> {
    return updateValidMeasurementUnitConversion(this.client, validMeasurementUnitID, input);
  }

  async deleteValidMeasurementUnitConversion(
    validMeasurementUnitID: string,
  ): Promise<AxiosResponse<ValidMeasurementUnitConversion>> {
    return deleteValidMeasurementUnitConversion(this.client, validMeasurementUnitID);
  }

  // valid preparation instruments
  async getValidPreparationInstrument(
    validPreparationInstrumentID: string,
  ): Promise<AxiosResponse<ValidPreparationInstrument>> {
    return getValidPreparationInstrument(this.client, validPreparationInstrumentID);
  }

  async validPreparationInstrumentsForPreparationID(
    validPreparationID: string,
  ): Promise<AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>> {
    return validPreparationInstrumentsForPreparationID(this.client, validPreparationID);
  }

  async validPreparationInstrumentsForInstrumentID(
    validInstrumentID: string,
  ): Promise<AxiosResponse<QueryFilteredResult<ValidPreparationInstrument>>> {
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
  ): Promise<AxiosResponse<QueryFilteredResult<ValidPreparation>>> {
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

  // service setting
  async createServiceSetting(input: ServiceSettingCreationRequestInput): Promise<AxiosResponse<ServiceSetting>> {
    return createServiceSetting(this.client, input);
  }

  async getServiceSetting(serviceSettingID: string): Promise<AxiosResponse<ServiceSetting>> {
    return getServiceSetting(this.client, serviceSettingID);
  }

  async getServiceSettings(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ServiceSetting>>> {
    return getServiceSettings(this.client, filter);
  }

  async updateServiceSetting(
    serviceSettingID: string,
    input: ServiceSettingUpdateRequestInput,
  ): Promise<AxiosResponse<ServiceSetting>> {
    return updateServiceSetting(this.client, serviceSettingID, input);
  }

  async deleteServiceSetting(serviceSettingID: string): Promise<AxiosResponse<ServiceSetting>> {
    return deleteServiceSetting(this.client, serviceSettingID);
  }

  async searchForServiceSettings(query: string): Promise<AxiosResponse<ServiceSetting[]>> {
    return searchForServiceSettings(this.client, query);
  }

  async createServiceSettingConfiguration(
    input: ServiceSettingConfigurationCreationRequestInput,
  ): Promise<AxiosResponse<ServiceSettingConfiguration>> {
    return createServiceSettingConfiguration(this.client, input);
  }

  async getServiceSettingConfigurationsForUser(): Promise<
    AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>
  > {
    return getServiceSettingConfigurationsForUser(this.client);
  }

  async getServiceSettingConfigurationsForHousehold(): Promise<
    AxiosResponse<QueryFilteredResult<ServiceSettingConfiguration>>
  > {
    return getServiceSettingConfigurationsForHousehold(this.client);
  }

  async updateServiceSettingConfiguration(
    serviceSettingConfigurationID: string,
    input: ServiceSettingConfigurationUpdateRequestInput,
  ): Promise<AxiosResponse<ServiceSettingConfiguration>> {
    return updateServiceSettingConfiguration(this.client, serviceSettingConfigurationID, input);
  }

  async deleteServiceSettingConfiguration(
    serviceSettingConfigurationID: string,
  ): Promise<AxiosResponse<ServiceSettingConfiguration>> {
    return deleteServiceSettingConfiguration(this.client, serviceSettingConfigurationID);
  }

  // valid ingredient states
  async createValidIngredientState(
    input: ValidIngredientStateCreationRequestInput,
  ): Promise<AxiosResponse<ValidIngredientState>> {
    return createValidIngredientState(this.client, input);
  }

  async getValidIngredientState(validPreparationID: string): Promise<AxiosResponse<ValidIngredientState>> {
    return getValidIngredientState(this.client, validPreparationID);
  }

  async getValidIngredientStates(
    filter: QueryFilter = QueryFilter.Default(),
  ): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientState>>> {
    return getValidIngredientStates(this.client, filter);
  }

  async updateValidIngredientState(
    validPreparationID: string,
    input: ValidIngredientStateUpdateRequestInput,
  ): Promise<AxiosResponse<ValidIngredientState>> {
    return updateValidIngredientState(this.client, validPreparationID, input);
  }

  async deleteValidIngredientState(validPreparationID: string): Promise<AxiosResponse<ValidIngredientState>> {
    return deleteValidIngredientState(this.client, validPreparationID);
  }

  async searchForValidIngredientStates(query: string): Promise<AxiosResponse<ValidIngredientState[]>> {
    return searchForValidIngredientStates(this.client, query);
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
