// Code generated by gen_typescript. DO NOT EDIT.

import { ValidIngredientState } from './validIngredientStates';
import { ValidIngredient } from './validIngredients';

export interface IValidIngredientStateIngredient {
  createdAt: NonNullable<string>;
  lastUpdatedAt?: string;
  archivedAt?: string;
  notes: NonNullable<string>;
  id: NonNullable<string>;
  ingredientState: NonNullable<ValidIngredientState>;
  ingredient: NonNullable<ValidIngredient>;
}

export class ValidIngredientStateIngredient implements IValidIngredientStateIngredient {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  lastUpdatedAt?: string;
  archivedAt?: string;
  notes: NonNullable<string> = '';
  id: NonNullable<string> = '';
  ingredientState: NonNullable<ValidIngredientState> = new ValidIngredientState();
  ingredient: NonNullable<ValidIngredient> = new ValidIngredient();

  constructor(input: Partial<ValidIngredientStateIngredient> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.notes = input.notes ?? '';
    this.id = input.id ?? '';
    this.ingredientState = input.ingredientState ?? new ValidIngredientState();
    this.ingredient = input.ingredient ?? new ValidIngredient();
  }
}

export interface IValidIngredientStateIngredientCreationRequestInput {
  notes: NonNullable<string>;
  validIngredientStateID: NonNullable<string>;
  validIngredientID: NonNullable<string>;
}

export class ValidIngredientStateIngredientCreationRequestInput
  implements IValidIngredientStateIngredientCreationRequestInput
{
  notes: NonNullable<string> = '';
  validIngredientStateID: NonNullable<string> = '';
  validIngredientID: NonNullable<string> = '';

  constructor(input: Partial<ValidIngredientStateIngredientCreationRequestInput> = {}) {
    this.notes = input.notes ?? '';
    this.validIngredientStateID = input.validIngredientStateID ?? '';
    this.validIngredientID = input.validIngredientID ?? '';
  }
}

export interface IValidIngredientStateIngredientUpdateRequestInput {
  notes?: string;
  validIngredientStateID?: string;
  validIngredientID?: string;
}

export class ValidIngredientStateIngredientUpdateRequestInput
  implements IValidIngredientStateIngredientUpdateRequestInput
{
  notes?: string;
  validIngredientStateID?: string;
  validIngredientID?: string;

  constructor(input: Partial<ValidIngredientStateIngredientUpdateRequestInput> = {}) {
    this.notes = input.notes;
    this.validIngredientStateID = input.validIngredientStateID;
    this.validIngredientID = input.validIngredientID;
  }
}
