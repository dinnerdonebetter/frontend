// Code generated by gen_typescript. DO NOT EDIT.

export interface IRecipeRating {
  createdAt: NonNullable<string>;
  lastUpdatedAt?: string;
  archivedAt?: string;
  notes: NonNullable<string>;
  id: NonNullable<string>;
  mealID: NonNullable<string>;
  byUser: NonNullable<string>;
  taste: NonNullable<number>;
  instructions: NonNullable<number>;
  overall: NonNullable<number>;
  cleanup: NonNullable<number>;
  difficulty: NonNullable<number>;
}

export class RecipeRating implements IRecipeRating {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  lastUpdatedAt?: string;
  archivedAt?: string;
  notes: NonNullable<string> = '';
  id: NonNullable<string> = '';
  mealID: NonNullable<string> = '';
  byUser: NonNullable<string> = '';
  taste: NonNullable<number> = 0;
  instructions: NonNullable<number> = 0;
  overall: NonNullable<number> = 0;
  cleanup: NonNullable<number> = 0;
  difficulty: NonNullable<number> = 0;

  constructor(input: Partial<RecipeRating> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.notes = input.notes ?? '';
    this.id = input.id ?? '';
    this.mealID = input.mealID ?? '';
    this.byUser = input.byUser ?? '';
    this.taste = input.taste ?? 0;
    this.instructions = input.instructions ?? 0;
    this.overall = input.overall ?? 0;
    this.cleanup = input.cleanup ?? 0;
    this.difficulty = input.difficulty ?? 0;
  }
}

export interface IRecipeRatingCreationRequestInput {
  mealID: NonNullable<string>;
  notes: NonNullable<string>;
  byUser: NonNullable<string>;
  taste: NonNullable<number>;
  difficulty: NonNullable<number>;
  cleanup: NonNullable<number>;
  instructions: NonNullable<number>;
  overall: NonNullable<number>;
}

export class RecipeRatingCreationRequestInput implements IRecipeRatingCreationRequestInput {
  mealID: NonNullable<string> = '';
  notes: NonNullable<string> = '';
  byUser: NonNullable<string> = '';
  taste: NonNullable<number> = 0;
  difficulty: NonNullable<number> = 0;
  cleanup: NonNullable<number> = 0;
  instructions: NonNullable<number> = 0;
  overall: NonNullable<number> = 0;

  constructor(input: Partial<RecipeRatingCreationRequestInput> = {}) {
    this.mealID = input.mealID ?? '';
    this.notes = input.notes ?? '';
    this.byUser = input.byUser ?? '';
    this.taste = input.taste ?? 0;
    this.difficulty = input.difficulty ?? 0;
    this.cleanup = input.cleanup ?? 0;
    this.instructions = input.instructions ?? 0;
    this.overall = input.overall ?? 0;
  }
}

export interface IRecipeRatingUpdateRequestInput {
  mealID?: string;
  taste?: number;
  difficulty?: number;
  cleanup?: number;
  instructions?: number;
  overall?: number;
  notes?: string;
  byUser?: string;
}

export class RecipeRatingUpdateRequestInput implements IRecipeRatingUpdateRequestInput {
  mealID?: string;
  taste?: number;
  difficulty?: number;
  cleanup?: number;
  instructions?: number;
  overall?: number;
  notes?: string;
  byUser?: string;

  constructor(input: Partial<RecipeRatingUpdateRequestInput> = {}) {
    this.mealID = input.mealID;
    this.taste = input.taste;
    this.difficulty = input.difficulty;
    this.cleanup = input.cleanup;
    this.instructions = input.instructions;
    this.overall = input.overall;
    this.notes = input.notes;
    this.byUser = input.byUser;
  }
}