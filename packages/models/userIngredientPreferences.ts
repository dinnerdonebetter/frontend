// Code generated by gen_typescript. DO NOT EDIT.

import { ValidIngredient } from './validIngredients';

export interface IUserIngredientPreference {
  createdAt: NonNullable<string>;
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: NonNullable<string>;
  notes: NonNullable<string>;
  belongsToUser: NonNullable<string>;
  ingredient: NonNullable<ValidIngredient>;
  rating: NonNullable<number>;
  allergy: NonNullable<boolean>;
}

export class UserIngredientPreference implements IUserIngredientPreference {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: NonNullable<string> = '';
  notes: NonNullable<string> = '';
  belongsToUser: NonNullable<string> = '';
  ingredient: NonNullable<ValidIngredient> = new ValidIngredient();
  rating: NonNullable<number> = 0;
  allergy: NonNullable<boolean> = false;

  constructor(input: Partial<UserIngredientPreference> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id ?? '';
    this.notes = input.notes ?? '';
    this.belongsToUser = input.belongsToUser ?? '';
    this.ingredient = input.ingredient ?? new ValidIngredient();
    this.rating = input.rating ?? 0;
    this.allergy = input.allergy ?? false;
  }
}

export interface IUserIngredientPreferenceCreationRequestInput {
  validIngredientGroupID: NonNullable<string>;
  validIngredientID: NonNullable<string>;
  notes: NonNullable<string>;
  rating: NonNullable<number>;
  allergy: NonNullable<boolean>;
}

export class UserIngredientPreferenceCreationRequestInput implements IUserIngredientPreferenceCreationRequestInput {
  validIngredientGroupID: NonNullable<string> = '';
  validIngredientID: NonNullable<string> = '';
  notes: NonNullable<string> = '';
  rating: NonNullable<number> = 0;
  allergy: NonNullable<boolean> = false;

  constructor(input: Partial<UserIngredientPreferenceCreationRequestInput> = {}) {
    this.validIngredientGroupID = input.validIngredientGroupID ?? '';
    this.validIngredientID = input.validIngredientID ?? '';
    this.notes = input.notes ?? '';
    this.rating = input.rating ?? 0;
    this.allergy = input.allergy ?? false;
  }
}

export interface IUserIngredientPreferenceUpdateRequestInput {
  notes?: string;
  ingredientID?: string;
  rating?: number;
  allergy?: boolean;
}

export class UserIngredientPreferenceUpdateRequestInput implements IUserIngredientPreferenceUpdateRequestInput {
  notes?: string;
  ingredientID?: string;
  rating?: number;
  allergy?: boolean = false;

  constructor(input: Partial<UserIngredientPreferenceUpdateRequestInput> = {}) {
    this.notes = input.notes;
    this.ingredientID = input.ingredientID;
    this.rating = input.rating;
    this.allergy = input.allergy ?? false;
  }
}
