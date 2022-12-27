// Code generated by gen_typescript. DO NOT EDIT.

import { RecipeMedia } from './recipeMedia';
import { RecipePrepTask, RecipePrepTaskWithinRecipeCreationRequestInput } from './recipePrepTasks';
import { RecipeStep, RecipeStepCreationRequestInput } from './recipeSteps';

export interface IRecipe {
  createdAt: NonNullable<string>;
  archivedAt?: string;
  inspiredByRecipeID?: string;
  lastUpdatedAt?: string;
  source: NonNullable<string>;
  description: NonNullable<string>;
  name: NonNullable<string>;
  belongsToUser: NonNullable<string>;
  id: NonNullable<string>;
  steps: NonNullable<Array<RecipeStep>>;
  media: NonNullable<Array<RecipeMedia>>;
  prepTasks: NonNullable<Array<RecipePrepTask>>;
  sealOfApproval: NonNullable<boolean>;
  yieldsPortions: NonNullable<number>;
}

export class Recipe implements IRecipe {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  archivedAt?: string;
  inspiredByRecipeID?: string;
  lastUpdatedAt?: string;
  source: NonNullable<string> = '';
  description: NonNullable<string> = '';
  name: NonNullable<string> = '';
  belongsToUser: NonNullable<string> = '';
  id: NonNullable<string> = '';
  steps: NonNullable<Array<RecipeStep>> = [];
  media: NonNullable<Array<RecipeMedia>> = [];
  prepTasks: NonNullable<Array<RecipePrepTask>> = [];
  sealOfApproval: NonNullable<boolean> = false;
  yieldsPortions: NonNullable<number> = 0;

  constructor(input: Partial<Recipe> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.archivedAt = input.archivedAt;
    this.inspiredByRecipeID = input.inspiredByRecipeID;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.source = input.source ?? '';
    this.description = input.description ?? '';
    this.name = input.name ?? '';
    this.belongsToUser = input.belongsToUser ?? '';
    this.id = input.id ?? '';
    this.steps = input.steps ?? [];
    this.media = input.media ?? [];
    this.prepTasks = input.prepTasks ?? [];
    this.sealOfApproval = input.sealOfApproval ?? false;
    this.yieldsPortions = input.yieldsPortions ?? 0;
  }
}

export interface IRecipeCreationRequestInput {
  inspiredByRecipeID?: string;
  name: NonNullable<string>;
  source: NonNullable<string>;
  description: NonNullable<string>;
  steps: NonNullable<Array<RecipeStepCreationRequestInput>>;
  prepTasks: NonNullable<Array<RecipePrepTaskWithinRecipeCreationRequestInput>>;
  alsoCreateMeal: NonNullable<boolean>;
  sealOfApproval: NonNullable<boolean>;
  yieldsPortions: NonNullable<number>;
}

export class RecipeCreationRequestInput implements IRecipeCreationRequestInput {
  inspiredByRecipeID?: string;
  name: NonNullable<string> = '';
  source: NonNullable<string> = '';
  description: NonNullable<string> = '';
  steps: NonNullable<Array<RecipeStepCreationRequestInput>> = [];
  prepTasks: NonNullable<Array<RecipePrepTaskWithinRecipeCreationRequestInput>> = [];
  alsoCreateMeal: NonNullable<boolean> = false;
  sealOfApproval: NonNullable<boolean> = false;
  yieldsPortions: NonNullable<number> = 0;

  constructor(input: Partial<RecipeCreationRequestInput> = {}) {
    this.inspiredByRecipeID = input.inspiredByRecipeID;
    this.name = input.name ?? '';
    this.source = input.source ?? '';
    this.description = input.description ?? '';
    this.steps = input.steps ?? [];
    this.prepTasks = input.prepTasks ?? [];
    this.alsoCreateMeal = input.alsoCreateMeal ?? false;
    this.sealOfApproval = input.sealOfApproval ?? false;
    this.yieldsPortions = input.yieldsPortions ?? 0;
  }
}

export interface IRecipeUpdateRequestInput {
  name?: string;
  source?: string;
  description?: string;
  inspiredByRecipeID?: string;
  sealOfApproval?: boolean;
  yieldsPortions?: number;
}

export class RecipeUpdateRequestInput implements IRecipeUpdateRequestInput {
  name?: string;
  source?: string;
  description?: string;
  inspiredByRecipeID?: string;
  sealOfApproval?: boolean = false;
  yieldsPortions?: number;

  constructor(input: Partial<RecipeUpdateRequestInput> = {}) {
    this.name = input.name;
    this.source = input.source;
    this.description = input.description;
    this.inspiredByRecipeID = input.inspiredByRecipeID;
    this.sealOfApproval = input.sealOfApproval ?? false;
    this.yieldsPortions = input.yieldsPortions;
  }
}
