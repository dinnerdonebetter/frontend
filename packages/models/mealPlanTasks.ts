// Code generated by gen_typescript. DO NOT EDIT.

import { MealPlanTaskStatus } from './_unions';
import { MealPlanOption } from './mealPlanOptions';
import { RecipePrepTask } from './recipePrepTasks';

export interface IMealPlanTask {
  recipePrepTask: NonNullable<RecipePrepTask>;
  createdAt: NonNullable<string>;
  lastUpdatedAt?: string;
  completedAt?: string;
  assignedToUser?: string;
  id: NonNullable<string>;
  status: NonNullable<MealPlanTaskStatus>;
  creationExplanation: NonNullable<string>;
  statusExplanation: NonNullable<string>;
  mealPlanOption: NonNullable<MealPlanOption>;
}

export class MealPlanTask implements IMealPlanTask {
  recipePrepTask: NonNullable<RecipePrepTask> = new RecipePrepTask();
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  lastUpdatedAt?: string;
  completedAt?: string;
  assignedToUser?: string;
  id: NonNullable<string> = '';
  status: NonNullable<MealPlanTaskStatus> = 'unfinished';
  creationExplanation: NonNullable<string> = '';
  statusExplanation: NonNullable<string> = '';
  mealPlanOption: NonNullable<MealPlanOption> = new MealPlanOption();

  constructor(input: Partial<MealPlanTask> = {}) {
    this.recipePrepTask = input.recipePrepTask ?? new RecipePrepTask();
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.completedAt = input.completedAt;
    this.assignedToUser = input.assignedToUser;
    this.id = input.id ?? '';
    this.status = input.status ?? 'unfinished';
    this.creationExplanation = input.creationExplanation ?? '';
    this.statusExplanation = input.statusExplanation ?? '';
    this.mealPlanOption = input.mealPlanOption ?? new MealPlanOption();
  }
}

export interface IMealPlanTaskCreationRequestInput {
  assignedToUser?: string;
  status: NonNullable<MealPlanTaskStatus>;
  creationExplanation: NonNullable<string>;
  statusExplanation: NonNullable<string>;
  mealPlanOptionID: NonNullable<string>;
  recipePrepTaskID: NonNullable<string>;
}

export class MealPlanTaskCreationRequestInput implements IMealPlanTaskCreationRequestInput {
  assignedToUser?: string;
  status: NonNullable<MealPlanTaskStatus> = 'unfinished';
  creationExplanation: NonNullable<string> = '';
  statusExplanation: NonNullable<string> = '';
  mealPlanOptionID: NonNullable<string> = '';
  recipePrepTaskID: NonNullable<string> = '';

  constructor(input: Partial<MealPlanTaskCreationRequestInput> = {}) {
    this.assignedToUser = input.assignedToUser;
    this.status = input.status ?? 'unfinished';
    this.creationExplanation = input.creationExplanation ?? '';
    this.statusExplanation = input.statusExplanation ?? '';
    this.mealPlanOptionID = input.mealPlanOptionID ?? '';
    this.recipePrepTaskID = input.recipePrepTaskID ?? '';
  }
}

export interface IMealPlanTaskStatusChangeRequestInput {
  status?: string;
  statusExplanation: NonNullable<string>;
  assignedToUser?: string;
}

export class MealPlanTaskStatusChangeRequestInput implements IMealPlanTaskStatusChangeRequestInput {
  status?: string;
  statusExplanation: NonNullable<string> = '';
  assignedToUser?: string;

  constructor(input: Partial<MealPlanTaskStatusChangeRequestInput> = {}) {
    this.status = input.status;
    this.statusExplanation = input.statusExplanation ?? '';
    this.assignedToUser = input.assignedToUser;
  }
}
