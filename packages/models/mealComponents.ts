// Code generated by gen_typescript. DO NOT EDIT.

import { MealComponentType } from './_unions';
import { Recipe } from './recipes';

export interface IMealComponent {
  componentType: NonNullable<MealComponentType>;
  recipe: NonNullable<Recipe>;
  recipeScale: NonNullable<number>;
}

export class MealComponent implements IMealComponent {
  componentType: NonNullable<MealComponentType> = 'unspecified';
  recipe: NonNullable<Recipe> = new Recipe();
  recipeScale: NonNullable<number> = 0;

  constructor(input: Partial<MealComponent> = {}) {
    this.componentType = input.componentType ?? 'unspecified';
    this.recipe = input.recipe ?? new Recipe();
    this.recipeScale = input.recipeScale ?? 0;
  }
}

export interface IMealComponentCreationRequestInput {
  recipeID: NonNullable<string>;
  componentType: NonNullable<MealComponentType>;
  recipeScale: NonNullable<number>;
}

export class MealComponentCreationRequestInput implements IMealComponentCreationRequestInput {
  recipeID: NonNullable<string> = '';
  componentType: NonNullable<MealComponentType> = 'unspecified';
  recipeScale: NonNullable<number> = 0;

  constructor(input: Partial<MealComponentCreationRequestInput> = {}) {
    this.recipeID = input.recipeID ?? '';
    this.componentType = input.componentType ?? 'unspecified';
    this.recipeScale = input.recipeScale ?? 0;
  }
}

export interface IMealComponentUpdateRequestInput {
  recipeID?: string;
  componentType?: MealComponentType;
  recipeScale?: number;
}

export class MealComponentUpdateRequestInput implements IMealComponentUpdateRequestInput {
  recipeID?: string;
  componentType?: MealComponentType = 'unspecified';
  recipeScale?: number;

  constructor(input: Partial<MealComponentUpdateRequestInput> = {}) {
    this.recipeID = input.recipeID;
    this.componentType = input.componentType ?? 'unspecified';
    this.recipeScale = input.recipeScale;
  }
}
