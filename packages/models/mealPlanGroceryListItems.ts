// Code generated by gen_typescript. DO NOT EDIT.

import { ValidMealPlanGroceryListItemStatus } from './_unions';
import { ValidIngredient } from './validIngredients';
import { ValidMeasurementUnit } from './validMeasurementUnits';

export interface IMealPlanGroceryListItem {
  createdAt: NonNullable<string>;
  maximumQuantityNeeded?: number;
  lastUpdatedAt?: string;
  purchasePrice?: number;
  purchasedUPC?: string;
  archivedAt?: string;
  quantityPurchased?: number;
  purchasedMeasurementUnit?: ValidMeasurementUnit;
  belongsToMealPlan: NonNullable<string>;
  status: NonNullable<ValidMealPlanGroceryListItemStatus>;
  statusExplanation: NonNullable<string>;
  id: NonNullable<string>;
  measurementUnit: NonNullable<ValidMeasurementUnit>;
  ingredient: NonNullable<ValidIngredient>;
  minimumQuantityNeeded: NonNullable<number>;
}

export class MealPlanGroceryListItem implements IMealPlanGroceryListItem {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  maximumQuantityNeeded?: number;
  lastUpdatedAt?: string;
  purchasePrice?: number;
  purchasedUPC?: string;
  archivedAt?: string;
  quantityPurchased?: number;
  purchasedMeasurementUnit?: ValidMeasurementUnit;
  belongsToMealPlan: NonNullable<string> = '';
  status: NonNullable<ValidMealPlanGroceryListItemStatus> = 'unknown';
  statusExplanation: NonNullable<string> = '';
  id: NonNullable<string> = '';
  measurementUnit: NonNullable<ValidMeasurementUnit> = new ValidMeasurementUnit();
  ingredient: NonNullable<ValidIngredient> = new ValidIngredient();
  minimumQuantityNeeded: NonNullable<number> = 0;

  constructor(input: Partial<MealPlanGroceryListItem> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.maximumQuantityNeeded = input.maximumQuantityNeeded;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.purchasePrice = input.purchasePrice;
    this.purchasedUPC = input.purchasedUPC;
    this.archivedAt = input.archivedAt;
    this.quantityPurchased = input.quantityPurchased;
    this.purchasedMeasurementUnit = input.purchasedMeasurementUnit;
    this.belongsToMealPlan = input.belongsToMealPlan ?? '';
    this.status = input.status ?? 'unknown';
    this.statusExplanation = input.statusExplanation ?? '';
    this.id = input.id ?? '';
    this.measurementUnit = input.measurementUnit ?? new ValidMeasurementUnit();
    this.ingredient = input.ingredient ?? new ValidIngredient();
    this.minimumQuantityNeeded = input.minimumQuantityNeeded ?? 0;
  }
}

export interface IMealPlanGroceryListItemCreationRequestInput {
  purchasedMeasurementUnitID?: string;
  purchasedUPC?: string;
  purchasePrice?: number;
  quantityPurchased?: number;
  maximumQuantityNeeded?: number;
  status: NonNullable<ValidMealPlanGroceryListItemStatus>;
  belongsToMealPlan: NonNullable<string>;
  validIngredientID: NonNullable<string>;
  validMeasurementUnitID: NonNullable<string>;
  statusExplanation: NonNullable<string>;
  minimumQuantityNeeded: NonNullable<number>;
}

export class MealPlanGroceryListItemCreationRequestInput implements IMealPlanGroceryListItemCreationRequestInput {
  purchasedMeasurementUnitID?: string;
  purchasedUPC?: string;
  purchasePrice?: number;
  quantityPurchased?: number;
  maximumQuantityNeeded?: number;
  status: NonNullable<ValidMealPlanGroceryListItemStatus> = 'unknown';
  belongsToMealPlan: NonNullable<string> = '';
  validIngredientID: NonNullable<string> = '';
  validMeasurementUnitID: NonNullable<string> = '';
  statusExplanation: NonNullable<string> = '';
  minimumQuantityNeeded: NonNullable<number> = 0;

  constructor(input: Partial<MealPlanGroceryListItemCreationRequestInput> = {}) {
    this.purchasedMeasurementUnitID = input.purchasedMeasurementUnitID;
    this.purchasedUPC = input.purchasedUPC;
    this.purchasePrice = input.purchasePrice;
    this.quantityPurchased = input.quantityPurchased;
    this.maximumQuantityNeeded = input.maximumQuantityNeeded;
    this.status = input.status ?? 'unknown';
    this.belongsToMealPlan = input.belongsToMealPlan ?? '';
    this.validIngredientID = input.validIngredientID ?? '';
    this.validMeasurementUnitID = input.validMeasurementUnitID ?? '';
    this.statusExplanation = input.statusExplanation ?? '';
    this.minimumQuantityNeeded = input.minimumQuantityNeeded ?? 0;
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
  status?: ValidMealPlanGroceryListItemStatus;
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
  status?: ValidMealPlanGroceryListItemStatus = 'unknown';

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
    this.status = input.status ?? 'unknown';
  }
}
