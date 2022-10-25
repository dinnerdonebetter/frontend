import { QueryFilteredResult } from './pagination';
import { ValidMeasurementUnit } from './validMeasurementUnits';
import { ValidIngredient } from './validIngredients';

export class MealPlanGroceryListItem {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  createdAt: string;
  quantityPurchased?: number;
  purchasePrice?: number;
  purchasedUPC?: string;
  purchasedMeasurementUnit?: ValidMeasurementUnit;
  statusExplanation: string;
  status: string;
  measurementUnit: ValidMeasurementUnit;
  belongsToMealPlan: string;
  ingredient: ValidIngredient;
  maximumQuantityNeeded: number;
  minimumQuantityNeeded: number;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      createdAt?: string;
      quantityPurchased?: number;
      purchasePrice?: number;
      purchasedUPC?: string;
      purchasedMeasurementUnit?: ValidMeasurementUnit;
      statusExplanation?: string;
      status?: string;
      measurementUnit?: ValidMeasurementUnit;
      belongsToMealPlan?: string;
      ingredient?: ValidIngredient;
      maximumQuantityNeeded?: number;
      minimumQuantityNeeded?: number;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.quantityPurchased = input.quantityPurchased;
    this.purchasePrice = input.purchasePrice;
    this.purchasedUPC = input.purchasedUPC;
    this.purchasedMeasurementUnit = input.purchasedMeasurementUnit;
    this.statusExplanation = input.statusExplanation || '';
    this.status = input.status || '';
    this.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    this.belongsToMealPlan = input.belongsToMealPlan || '';
    this.ingredient = input.ingredient || new ValidIngredient();
    this.maximumQuantityNeeded = input.maximumQuantityNeeded || -1;
    this.minimumQuantityNeeded = input.minimumQuantityNeeded || -1;
  }
}

export class MealPlanGroceryListItemList extends QueryFilteredResult<MealPlanGroceryListItem> {
  constructor(
    input: {
      data?: MealPlanGroceryListItem[];
      page?: number;
      limit?: number;
      filteredCount?: number;
      totalCount?: number;
    } = {},
  ) {
    super(input);

    this.data = input.data || [];
    this.page = input.page || 1;
    this.limit = input.limit || 20;
    this.filteredCount = input.filteredCount || 0;
    this.totalCount = input.totalCount || 0;
  }
}

export class MealPlanGroceryListItemCreationRequestInput {
  quantityPurchased?: number;
  purchasePrice?: number;
  purchasedUPC?: string;
  purchasedMeasurementUnit?: ValidMeasurementUnit;
  statusExplanation: string;
  status: string;
  measurementUnit: ValidMeasurementUnit;
  belongsToMealPlan: string;
  ingredient: ValidIngredient;
  maximumQuantityNeeded: number;
  minimumQuantityNeeded: number;

  constructor(
    input: {
      quantityPurchased?: number;
      purchasePrice?: number;
      purchasedUPC?: string;
      purchasedMeasurementUnit?: ValidMeasurementUnit;
      statusExplanation?: string;
      status?: string;
      measurementUnit?: ValidMeasurementUnit;
      belongsToMealPlan?: string;
      ingredient?: ValidIngredient;
      maximumQuantityNeeded?: number;
      minimumQuantityNeeded?: number;
    } = {},
  ) {
    this.quantityPurchased = input.quantityPurchased;
    this.purchasePrice = input.purchasePrice;
    this.purchasedUPC = input.purchasedUPC;
    this.purchasedMeasurementUnit = input.purchasedMeasurementUnit;
    this.statusExplanation = input.statusExplanation || '';
    this.status = input.status || '';
    this.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    this.belongsToMealPlan = input.belongsToMealPlan || '';
    this.ingredient = input.ingredient || new ValidIngredient();
    this.maximumQuantityNeeded = input.maximumQuantityNeeded || -1;
    this.minimumQuantityNeeded = input.minimumQuantityNeeded || -1;
  }

  static fromMealPlanGroceryListItem(input: MealPlanGroceryListItem): MealPlanGroceryListItemCreationRequestInput {
    const x = new MealPlanGroceryListItemCreationRequestInput();

    x.quantityPurchased = input.quantityPurchased;
    x.purchasePrice = input.purchasePrice;
    x.purchasedUPC = input.purchasedUPC;
    x.purchasedMeasurementUnit = input.purchasedMeasurementUnit;
    x.statusExplanation = input.statusExplanation || '';
    x.status = input.status || '';
    x.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    x.belongsToMealPlan = input.belongsToMealPlan || '';
    x.ingredient = input.ingredient || new ValidIngredient();
    x.maximumQuantityNeeded = input.maximumQuantityNeeded || -1;
    x.minimumQuantityNeeded = input.minimumQuantityNeeded || -1;

    return x;
  }
}

export class MealPlanGroceryListItemUpdateRequestInput {
  quantityPurchased?: number;
  purchasePrice?: number;
  purchasedUPC?: string;
  purchasedMeasurementUnit?: ValidMeasurementUnit;
  statusExplanation: string;
  status: string;
  measurementUnit: ValidMeasurementUnit;
  belongsToMealPlan: string;
  ingredient: ValidIngredient;
  maximumQuantityNeeded: number;
  minimumQuantityNeeded: number;

  constructor(
    input: {
      quantityPurchased?: number;
      purchasePrice?: number;
      purchasedUPC?: string;
      purchasedMeasurementUnit?: ValidMeasurementUnit;
      statusExplanation?: string;
      status?: string;
      measurementUnit?: ValidMeasurementUnit;
      belongsToMealPlan?: string;
      ingredient?: ValidIngredient;
      maximumQuantityNeeded?: number;
      minimumQuantityNeeded?: number;
    } = {},
  ) {
    this.quantityPurchased = input.quantityPurchased;
    this.purchasePrice = input.purchasePrice;
    this.purchasedUPC = input.purchasedUPC;
    this.purchasedMeasurementUnit = input.purchasedMeasurementUnit;
    this.statusExplanation = input.statusExplanation || '';
    this.status = input.status || '';
    this.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    this.belongsToMealPlan = input.belongsToMealPlan || '';
    this.ingredient = input.ingredient || new ValidIngredient();
    this.maximumQuantityNeeded = input.maximumQuantityNeeded || -1;
    this.minimumQuantityNeeded = input.minimumQuantityNeeded || -1;
  }

  static fromMealPlanGroceryListItem(input: MealPlanGroceryListItem): MealPlanGroceryListItemUpdateRequestInput {
    const x = new MealPlanGroceryListItemUpdateRequestInput();

    x.quantityPurchased = input.quantityPurchased;
    x.purchasePrice = input.purchasePrice;
    x.purchasedUPC = input.purchasedUPC;
    x.purchasedMeasurementUnit = input.purchasedMeasurementUnit;
    x.statusExplanation = input.statusExplanation || '';
    x.status = input.status || '';
    x.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    x.belongsToMealPlan = input.belongsToMealPlan || '';
    x.ingredient = input.ingredient || new ValidIngredient();
    x.maximumQuantityNeeded = input.maximumQuantityNeeded || -1;
    x.minimumQuantityNeeded = input.minimumQuantityNeeded || -1;

    return x;
  }
}
