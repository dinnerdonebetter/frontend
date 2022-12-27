// Code generated by gen_typescript. DO NOT EDIT.

import {
  RecipePrepTaskStep,
  RecipePrepTaskStepCreationRequestInput,
  RecipePrepTaskStepUpdateRequestInput,
  RecipePrepTaskStepWithinRecipeCreationRequestInput,
} from './recipePrepTaskSteps';

export interface IRecipePrepTask {
  createdAt: NonNullable<string>;
  archivedAt?: string;
  lastUpdatedAt?: string;
  notes: NonNullable<string>;
  explicitStorageInstructions: NonNullable<string>;
  storageType: NonNullable<string>;
  belongsToRecipe: NonNullable<string>;
  id: NonNullable<string>;
  recipeSteps: NonNullable<Array<RecipePrepTaskStep>>;
  minimumTimeBufferBeforeRecipeInSeconds: NonNullable<number>;
  maximumStorageTemperatureInCelsius: NonNullable<number>;
  maximumTimeBufferBeforeRecipeInSeconds: NonNullable<number>;
  minimumStorageTemperatureInCelsius: NonNullable<number>;
}

export class RecipePrepTask implements IRecipePrepTask {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  archivedAt?: string;
  lastUpdatedAt?: string;
  notes: NonNullable<string> = '';
  explicitStorageInstructions: NonNullable<string> = '';
  storageType: NonNullable<string> = '';
  belongsToRecipe: NonNullable<string> = '';
  id: NonNullable<string> = '';
  recipeSteps: NonNullable<Array<RecipePrepTaskStep>> = [];
  minimumTimeBufferBeforeRecipeInSeconds: NonNullable<number> = 0;
  maximumStorageTemperatureInCelsius: NonNullable<number> = 0;
  maximumTimeBufferBeforeRecipeInSeconds: NonNullable<number> = 0;
  minimumStorageTemperatureInCelsius: NonNullable<number> = 0;

  constructor(input: Partial<RecipePrepTask> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.notes = input.notes ?? '';
    this.explicitStorageInstructions = input.explicitStorageInstructions ?? '';
    this.storageType = input.storageType ?? '';
    this.belongsToRecipe = input.belongsToRecipe ?? '';
    this.id = input.id ?? '';
    this.recipeSteps = input.recipeSteps ?? [];
    this.minimumTimeBufferBeforeRecipeInSeconds = input.minimumTimeBufferBeforeRecipeInSeconds ?? 0;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius ?? 0;
    this.maximumTimeBufferBeforeRecipeInSeconds = input.maximumTimeBufferBeforeRecipeInSeconds ?? 0;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius ?? 0;
  }
}

export interface IRecipePrepTaskCreationRequestInput {
  notes: NonNullable<string>;
  explicitStorageInstructions: NonNullable<string>;
  storageType: NonNullable<string>;
  belongsToRecipe: NonNullable<string>;
  recipeSteps: NonNullable<Array<RecipePrepTaskStepCreationRequestInput>>;
  maximumTimeBufferBeforeRecipeInSeconds: NonNullable<number>;
  minimumStorageTemperatureInCelsius: NonNullable<number>;
  maximumStorageTemperatureInCelsius: NonNullable<number>;
  minimumTimeBufferBeforeRecipeInSeconds: NonNullable<number>;
}

export class RecipePrepTaskCreationRequestInput implements IRecipePrepTaskCreationRequestInput {
  notes: NonNullable<string> = '';
  explicitStorageInstructions: NonNullable<string> = '';
  storageType: NonNullable<string> = '';
  belongsToRecipe: NonNullable<string> = '';
  recipeSteps: NonNullable<Array<RecipePrepTaskStepCreationRequestInput>> = [];
  maximumTimeBufferBeforeRecipeInSeconds: NonNullable<number> = 0;
  minimumStorageTemperatureInCelsius: NonNullable<number> = 0;
  maximumStorageTemperatureInCelsius: NonNullable<number> = 0;
  minimumTimeBufferBeforeRecipeInSeconds: NonNullable<number> = 0;

  constructor(input: Partial<RecipePrepTaskCreationRequestInput> = {}) {
    this.notes = input.notes ?? '';
    this.explicitStorageInstructions = input.explicitStorageInstructions ?? '';
    this.storageType = input.storageType ?? '';
    this.belongsToRecipe = input.belongsToRecipe ?? '';
    this.recipeSteps = input.recipeSteps ?? [];
    this.maximumTimeBufferBeforeRecipeInSeconds = input.maximumTimeBufferBeforeRecipeInSeconds ?? 0;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius ?? 0;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius ?? 0;
    this.minimumTimeBufferBeforeRecipeInSeconds = input.minimumTimeBufferBeforeRecipeInSeconds ?? 0;
  }
}

export interface IRecipePrepTaskWithinRecipeCreationRequestInput {
  notes: NonNullable<string>;
  explicitStorageInstructions: NonNullable<string>;
  storageType: NonNullable<string>;
  belongsToRecipe: NonNullable<string>;
  recipeSteps: NonNullable<Array<RecipePrepTaskStepWithinRecipeCreationRequestInput>>;
  maximumTimeBufferBeforeRecipeInSeconds: NonNullable<number>;
  minimumStorageTemperatureInCelsius: NonNullable<number>;
  maximumStorageTemperatureInCelsius: NonNullable<number>;
  minimumTimeBufferBeforeRecipeInSeconds: NonNullable<number>;
}

export class RecipePrepTaskWithinRecipeCreationRequestInput implements IRecipePrepTaskWithinRecipeCreationRequestInput {
  notes: NonNullable<string> = '';
  explicitStorageInstructions: NonNullable<string> = '';
  storageType: NonNullable<string> = '';
  belongsToRecipe: NonNullable<string> = '';
  recipeSteps: NonNullable<Array<RecipePrepTaskStepWithinRecipeCreationRequestInput>> = [];
  maximumTimeBufferBeforeRecipeInSeconds: NonNullable<number> = 0;
  minimumStorageTemperatureInCelsius: NonNullable<number> = 0;
  maximumStorageTemperatureInCelsius: NonNullable<number> = 0;
  minimumTimeBufferBeforeRecipeInSeconds: NonNullable<number> = 0;

  constructor(input: Partial<RecipePrepTaskWithinRecipeCreationRequestInput> = {}) {
    this.notes = input.notes ?? '';
    this.explicitStorageInstructions = input.explicitStorageInstructions ?? '';
    this.storageType = input.storageType ?? '';
    this.belongsToRecipe = input.belongsToRecipe ?? '';
    this.recipeSteps = input.recipeSteps ?? [];
    this.maximumTimeBufferBeforeRecipeInSeconds = input.maximumTimeBufferBeforeRecipeInSeconds ?? 0;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius ?? 0;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius ?? 0;
    this.minimumTimeBufferBeforeRecipeInSeconds = input.minimumTimeBufferBeforeRecipeInSeconds ?? 0;
  }
}

export interface IRecipePrepTaskUpdateRequestInput {
  notes?: string;
  explicitStorageInstructions?: string;
  minimumTimeBufferBeforeRecipeInSeconds?: number;
  maximumTimeBufferBeforeRecipeInSeconds?: number;
  storageType?: string;
  minimumStorageTemperatureInCelsius?: number;
  maximumStorageTemperatureInCelsius?: number;
  belongsToRecipe?: string;
  recipeSteps: NonNullable<Array<RecipePrepTaskStepUpdateRequestInput>>;
}

export class RecipePrepTaskUpdateRequestInput implements IRecipePrepTaskUpdateRequestInput {
  notes?: string;
  explicitStorageInstructions?: string;
  minimumTimeBufferBeforeRecipeInSeconds?: number;
  maximumTimeBufferBeforeRecipeInSeconds?: number;
  storageType?: string;
  minimumStorageTemperatureInCelsius?: number;
  maximumStorageTemperatureInCelsius?: number;
  belongsToRecipe?: string;
  recipeSteps: NonNullable<Array<RecipePrepTaskStepUpdateRequestInput>> = [];

  constructor(input: Partial<RecipePrepTaskUpdateRequestInput> = {}) {
    this.notes = input.notes;
    this.explicitStorageInstructions = input.explicitStorageInstructions;
    this.minimumTimeBufferBeforeRecipeInSeconds = input.minimumTimeBufferBeforeRecipeInSeconds;
    this.maximumTimeBufferBeforeRecipeInSeconds = input.maximumTimeBufferBeforeRecipeInSeconds;
    this.storageType = input.storageType;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius;
    this.belongsToRecipe = input.belongsToRecipe;
    this.recipeSteps = input.recipeSteps ?? [];
  }
}
