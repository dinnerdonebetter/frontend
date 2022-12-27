// Code generated by gen_typescript. DO NOT EDIT.

import { ValidIngredient } from './validIngredients';
import { ValidMeasurementUnit } from './validMeasurementUnits';

export interface IMealPlanGroceryListItem {
  createdAt: NonNullable<string>;
  purchasedMeasurementUnit?: ValidMeasurementUnit;
  lastUpdatedAt?: string;
  purchasePrice?: number;
  purchasedUPC?: string;
  archivedAt?: string;
  quantityPurchased?: number;
  belongsToMealPlan: NonNullable<string>;
  id: NonNullable<string>;
  status: NonNullable<string>;
  statusExplanation: NonNullable<string>;
  measurementUnit: NonNullable<ValidMeasurementUnit>;
  ingredient: NonNullable<ValidIngredient>;
  maximumQuantityNeeded: NonNullable<number>;
  minimumQuantityNeeded: NonNullable<number>;
}

export class MealPlanGroceryListItem implements IMealPlanGroceryListItem {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  purchasedMeasurementUnit?: ValidMeasurementUnit = new ValidMeasurementUnit();
  lastUpdatedAt?: string;
  purchasePrice?: number;
  purchasedUPC?: string;
  archivedAt?: string;
  quantityPurchased?: number;
  belongsToMealPlan: NonNullable<string> = '';
  id: NonNullable<string> = '';
  status: NonNullable<string> = '';
  statusExplanation: NonNullable<string> = '';
  measurementUnit: NonNullable<ValidMeasurementUnit> = new ValidMeasurementUnit();
  ingredient: NonNullable<ValidIngredient> = new ValidIngredient();
  maximumQuantityNeeded: NonNullable<number> = 0;
  minimumQuantityNeeded: NonNullable<number> = 0;

  constructor(input: Partial<MealPlanGroceryListItem> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.purchasedMeasurementUnit = input.purchasedMeasurementUnit ?? new ValidMeasurementUnit();
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.purchasePrice = input.purchasePrice;
    this.purchasedUPC = input.purchasedUPC;
    this.archivedAt = input.archivedAt;
    this.quantityPurchased = input.quantityPurchased;
    this.belongsToMealPlan = input.belongsToMealPlan ?? '';
    this.id = input.id ?? '';
    this.status = input.status ?? '';
    this.statusExplanation = input.statusExplanation ?? '';
    this.measurementUnit = input.measurementUnit ?? new ValidMeasurementUnit();
    this.ingredient = input.ingredient ?? new ValidIngredient();
    this.maximumQuantityNeeded = input.maximumQuantityNeeded ?? 0;
    this.minimumQuantityNeeded = input.minimumQuantityNeeded ?? 0;
  }
}

export interface IMealPlanGroceryListItemCreationRequestInput {
  purchasedMeasurementUnitID?: string;
  purchasedUPC?: string;
  purchasePrice?: number;
  quantityPurchased?: number;
  statusExplanation: NonNullable<string>;
  status: NonNullable<string>;
  belongsToMealPlan: NonNullable<string>;
  validIngredientID: NonNullable<string>;
  validMeasurementUnitID: NonNullable<string>;
  minimumQuantityNeeded: NonNullable<number>;
  maximumQuantityNeeded: NonNullable<number>;
}

export class MealPlanGroceryListItemCreationRequestInput implements IMealPlanGroceryListItemCreationRequestInput {
  purchasedMeasurementUnitID?: string;
  purchasedUPC?: string;
  purchasePrice?: number;
  quantityPurchased?: number;
  statusExplanation: NonNullable<string> = '';
  status: NonNullable<string> = '';
  belongsToMealPlan: NonNullable<string> = '';
  validIngredientID: NonNullable<string> = '';
  validMeasurementUnitID: NonNullable<string> = '';
  minimumQuantityNeeded: NonNullable<number> = 0;
  maximumQuantityNeeded: NonNullable<number> = 0;

  constructor(input: Partial<MealPlanGroceryListItemCreationRequestInput> = {}) {
    this.purchasedMeasurementUnitID = input.purchasedMeasurementUnitID;
    this.purchasedUPC = input.purchasedUPC;
    this.purchasePrice = input.purchasePrice;
    this.quantityPurchased = input.quantityPurchased;
    this.statusExplanation = input.statusExplanation ?? '';
    this.status = input.status ?? '';
    this.belongsToMealPlan = input.belongsToMealPlan ?? '';
    this.validIngredientID = input.validIngredientID ?? '';
    this.validMeasurementUnitID = input.validMeasurementUnitID ?? '';
    this.minimumQuantityNeeded = input.minimumQuantityNeeded ?? 0;
    this.maximumQuantityNeeded = input.maximumQuantityNeeded ?? 0;
  }
}

export interface IMealPlanGroceryListItemUpdateRequestInput {
  maximumQuantityNeeded?: number;
  belongsToMealPlan?: string;
  validIngredientID?: string;
  validMeasurementUnitID?: string;
  minimumQuantityNeeded?: number;
  statusExplanation?: string;
  quantityPurchased?: number;
  purchasedMeasurementUnitID?: string;
  purchasedUPC?: string;
  purchasePrice?: number;
  status?: string;
}

export class MealPlanGroceryListItemUpdateRequestInput implements IMealPlanGroceryListItemUpdateRequestInput {
  maximumQuantityNeeded?: number;
  belongsToMealPlan?: string;
  validIngredientID?: string;
  validMeasurementUnitID?: string;
  minimumQuantityNeeded?: number;
  statusExplanation?: string;
  quantityPurchased?: number;
  purchasedMeasurementUnitID?: string;
  purchasedUPC?: string;
  purchasePrice?: number;
  status?: string;

  constructor(input: Partial<MealPlanGroceryListItemUpdateRequestInput> = {}) {
    this.maximumQuantityNeeded = input.maximumQuantityNeeded;
    this.belongsToMealPlan = input.belongsToMealPlan;
    this.validIngredientID = input.validIngredientID;
    this.validMeasurementUnitID = input.validMeasurementUnitID;
    this.minimumQuantityNeeded = input.minimumQuantityNeeded;
    this.statusExplanation = input.statusExplanation;
    this.quantityPurchased = input.quantityPurchased;
    this.purchasedMeasurementUnitID = input.purchasedMeasurementUnitID;
    this.purchasedUPC = input.purchasedUPC;
    this.purchasePrice = input.purchasePrice;
    this.status = input.status;
  }
}
