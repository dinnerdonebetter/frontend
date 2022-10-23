import { QueryFilteredResult } from "./pagination";

import { RecipePrepTaskStep } from "./recipePrepTaskSteps";

export type validStorageType =
  | "uncovered"
  | "covered"
  | "on a wire rack"
  | "in an airtight container";

export class RecipePrepTask {
  id: string;
  notes?: string;
  explicitStorageInstructions: string;
  storageType: validStorageType;
  belongsToRecipe: string;
  recipeSteps?: RecipePrepTaskStep[];
  minimumTimeBufferBeforeRecipeInSeconds: Number;
  maximumStorageTemperatureInCelsius: Number;
  maximumTimeBufferBeforeRecipeInSeconds: Number;
  minimumStorageTemperatureInCelsius: Number;
  createdAt: string;
  lastUpdatedAt?: string;
  archivedAt?: string;

  constructor(
    input: {
      id?: string;
      notes?: string;
      explicitStorageInstructions?: string;
      storageType?: validStorageType;
      belongsToRecipe?: string;
      recipeSteps?: RecipePrepTaskStep[];
      minimumTimeBufferBeforeRecipeInSeconds?: Number;
      maximumStorageTemperatureInCelsius?: Number;
      maximumTimeBufferBeforeRecipeInSeconds?: Number;
      minimumStorageTemperatureInCelsius?: Number;
      createdAt?: string;
      lastUpdatedAt?: string;
      archivedAt?: string;
    } = {}
  ) {
    this.id = input.id || "";
    this.notes = input.notes;
    this.explicitStorageInstructions = input.explicitStorageInstructions || "";
    this.storageType = input.storageType || "uncovered";
    this.belongsToRecipe = input.belongsToRecipe || "";
    this.recipeSteps = input.recipeSteps;
    this.minimumTimeBufferBeforeRecipeInSeconds =
      input.minimumTimeBufferBeforeRecipeInSeconds || -1;
    this.maximumStorageTemperatureInCelsius =
      input.maximumStorageTemperatureInCelsius || -1;
    this.maximumTimeBufferBeforeRecipeInSeconds =
      input.maximumTimeBufferBeforeRecipeInSeconds || -1;
    this.minimumStorageTemperatureInCelsius =
      input.minimumStorageTemperatureInCelsius || -1;
    this.createdAt = input.createdAt || "";
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
  }
}

export class RecipePrepTaskList extends QueryFilteredResult<RecipePrepTask> {
  constructor(
    input: {
      data?: RecipePrepTask[];
      page?: number;
      limit?: number;
      filteredCount?: number;
      totalCount?: number;
    } = {}
  ) {
    super(input);

    this.data = input.data || [];
    this.page = input.page || 1;
    this.limit = input.limit || 20;
    this.filteredCount = input.filteredCount || 0;
    this.totalCount = input.totalCount || 0;
  }
}

export class RecipePrepTaskCreationRequestInput {
  notes?: string;
  explicitStorageInstructions: string;
  storageType: validStorageType;
  belongsToRecipe: string;
  recipeSteps?: RecipePrepTaskStep[];
  minimumTimeBufferBeforeRecipeInSeconds: Number;
  maximumStorageTemperatureInCelsius: Number;
  maximumTimeBufferBeforeRecipeInSeconds: Number;
  minimumStorageTemperatureInCelsius: Number;

  constructor(
    input: {
      notes?: string;
      explicitStorageInstructions?: string;
      storageType?: validStorageType;
      belongsToRecipe?: string;
      recipeSteps?: RecipePrepTaskStep[];
      minimumTimeBufferBeforeRecipeInSeconds?: Number;
      maximumStorageTemperatureInCelsius?: Number;
      maximumTimeBufferBeforeRecipeInSeconds?: Number;
      minimumStorageTemperatureInCelsius?: Number;
    } = {}
  ) {
    this.notes = input.notes;
    this.explicitStorageInstructions = input.explicitStorageInstructions || "";
    this.storageType = input.storageType || "uncovered";
    this.belongsToRecipe = input.belongsToRecipe || "";
    this.recipeSteps = input.recipeSteps;
    this.minimumTimeBufferBeforeRecipeInSeconds =
      input.minimumTimeBufferBeforeRecipeInSeconds || -1;
    this.maximumStorageTemperatureInCelsius =
      input.maximumStorageTemperatureInCelsius || -1;
    this.maximumTimeBufferBeforeRecipeInSeconds =
      input.maximumTimeBufferBeforeRecipeInSeconds || -1;
    this.minimumStorageTemperatureInCelsius =
      input.minimumStorageTemperatureInCelsius || -1;
  }

  static fromRecipePrepTask(
    input: RecipePrepTask
  ): RecipePrepTaskCreationRequestInput {
    const x = new RecipePrepTaskCreationRequestInput();

    x.notes = input.notes;
    x.explicitStorageInstructions = input.explicitStorageInstructions;
    x.storageType = input.storageType;
    x.belongsToRecipe = input.belongsToRecipe;
    x.recipeSteps = input.recipeSteps;
    x.minimumTimeBufferBeforeRecipeInSeconds =
      input.minimumTimeBufferBeforeRecipeInSeconds;
    x.maximumStorageTemperatureInCelsius =
      input.maximumStorageTemperatureInCelsius;
    x.maximumTimeBufferBeforeRecipeInSeconds =
      input.maximumTimeBufferBeforeRecipeInSeconds;
    x.minimumStorageTemperatureInCelsius =
      input.minimumStorageTemperatureInCelsius;

    return x;
  }
}

export class RecipePrepTaskUpdateRequestInput {
  notes?: string;
  explicitStorageInstructions: string;
  storageType: validStorageType;
  belongsToRecipe: string;
  recipeSteps?: RecipePrepTaskStep[];
  minimumTimeBufferBeforeRecipeInSeconds: Number;
  maximumStorageTemperatureInCelsius: Number;
  maximumTimeBufferBeforeRecipeInSeconds: Number;
  minimumStorageTemperatureInCelsius: Number;

  constructor(
    input: {
      notes?: string;
      explicitStorageInstructions?: string;
      storageType?: validStorageType;
      belongsToRecipe?: string;
      recipeSteps?: RecipePrepTaskStep[];
      minimumTimeBufferBeforeRecipeInSeconds?: Number;
      maximumStorageTemperatureInCelsius?: Number;
      maximumTimeBufferBeforeRecipeInSeconds?: Number;
      minimumStorageTemperatureInCelsius?: Number;
    } = {}
  ) {
    this.notes = input.notes;
    this.explicitStorageInstructions = input.explicitStorageInstructions || "";
    this.storageType = input.storageType || "uncovered";
    this.belongsToRecipe = input.belongsToRecipe || "";
    this.recipeSteps = input.recipeSteps;
    this.minimumTimeBufferBeforeRecipeInSeconds =
      input.minimumTimeBufferBeforeRecipeInSeconds || -1;
    this.maximumStorageTemperatureInCelsius =
      input.maximumStorageTemperatureInCelsius || -1;
    this.maximumTimeBufferBeforeRecipeInSeconds =
      input.maximumTimeBufferBeforeRecipeInSeconds || -1;
    this.minimumStorageTemperatureInCelsius =
      input.minimumStorageTemperatureInCelsius || -1;
  }

  static fromRecipePrepTask(
    input: RecipePrepTask
  ): RecipePrepTaskUpdateRequestInput {
    const x = new RecipePrepTaskUpdateRequestInput();

    x.notes = input.notes;
    x.explicitStorageInstructions = input.explicitStorageInstructions;
    x.storageType = input.storageType;
    x.belongsToRecipe = input.belongsToRecipe;
    x.recipeSteps = input.recipeSteps;
    x.minimumTimeBufferBeforeRecipeInSeconds =
      input.minimumTimeBufferBeforeRecipeInSeconds;
    x.maximumStorageTemperatureInCelsius =
      input.maximumStorageTemperatureInCelsius;
    x.maximumTimeBufferBeforeRecipeInSeconds =
      input.maximumTimeBufferBeforeRecipeInSeconds;
    x.minimumStorageTemperatureInCelsius =
      input.minimumStorageTemperatureInCelsius;

    return x;
  }
}
