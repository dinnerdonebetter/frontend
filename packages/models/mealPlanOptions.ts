// Code generated by gen_typescript. DO NOT EDIT.

import { Meal } from './meals';
import { MealPlanOptionVote } from './mealPlanOptionVotes';

export interface IMealPlanOption {
  meal: NonNullable<Meal>;
  createdAt: NonNullable<string>;
  assignedCook?: string;
  archivedAt?: string;
  lastUpdatedAt?: string;
  assignedDishwasher?: string;
  notes: NonNullable<string>;
  belongsToMealPlanEvent: NonNullable<string>;
  id: NonNullable<string>;
  votes: NonNullable<Array<MealPlanOptionVote>>;
  chosen: NonNullable<boolean>;
  tieBroken: NonNullable<boolean>;
}

export class MealPlanOption implements IMealPlanOption {
  meal: NonNullable<Meal> = new Meal();
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  assignedCook?: string;
  archivedAt?: string;
  lastUpdatedAt?: string;
  assignedDishwasher?: string;
  notes: NonNullable<string> = '';
  belongsToMealPlanEvent: NonNullable<string> = '';
  id: NonNullable<string> = '';
  votes: NonNullable<Array<MealPlanOptionVote>> = [];
  chosen: NonNullable<boolean> = false;
  tieBroken: NonNullable<boolean> = false;

  constructor(
    input: {
      meal?: Meal;
      createdAt?: string;
      assignedCook?: string;
      archivedAt?: string;
      lastUpdatedAt?: string;
      assignedDishwasher?: string;
      notes?: string;
      belongsToMealPlanEvent?: string;
      id?: string;
      votes?: MealPlanOptionVote[];
      chosen?: boolean;
      tieBroken?: boolean;
    } = {},
  ) {
    this.meal = input.meal ?? new Meal();
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.assignedCook = input.assignedCook;
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.assignedDishwasher = input.assignedDishwasher;
    this.notes = input.notes ?? '';
    this.belongsToMealPlanEvent = input.belongsToMealPlanEvent ?? '';
    this.id = input.id ?? '';
    this.votes = input.votes ?? [];
    this.chosen = input.chosen ?? false;
    this.tieBroken = input.tieBroken ?? false;
  }
}

export interface IMealPlanOptionCreationRequestInput {
  assignedCook?: string;
  assignedDishwasher?: string;
  mealID: NonNullable<string>;
  notes: NonNullable<string>;
}

export class MealPlanOptionCreationRequestInput implements IMealPlanOptionCreationRequestInput {
  assignedCook?: string;
  assignedDishwasher?: string;
  mealID: NonNullable<string> = '';
  notes: NonNullable<string> = '';

  constructor(
    input: {
      assignedCook?: string;
      assignedDishwasher?: string;
      mealID?: string;
      notes?: string;
    } = {},
  ) {
    this.assignedCook = input.assignedCook;
    this.assignedDishwasher = input.assignedDishwasher;
    this.mealID = input.mealID ?? '';
    this.notes = input.notes ?? '';
  }
}

export interface IMealPlanOptionUpdateRequestInput {
  mealID?: string;
  notes?: string;
  assignedCook?: string;
  assignedDishwasher?: string;
}

export class MealPlanOptionUpdateRequestInput implements IMealPlanOptionUpdateRequestInput {
  mealID?: string;
  notes?: string;
  assignedCook?: string;
  assignedDishwasher?: string;

  constructor(
    input: {
      mealID?: string;
      notes?: string;
      assignedCook?: string;
      assignedDishwasher?: string;
    } = {},
  ) {
    this.mealID = input.mealID;
    this.notes = input.notes;
    this.assignedCook = input.assignedCook;
    this.assignedDishwasher = input.assignedDishwasher;
  }
}
