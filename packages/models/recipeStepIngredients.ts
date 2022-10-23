import { QueryFilteredResult } from "./pagination";
import { ValidIngredient } from "./validIngredients";
import { ValidMeasurementUnit } from "./validMeasurementUnits";

export class RecipeStepIngredient {
  lastUpdatedAt?: string;
  ingredient?: ValidIngredient;
  recipeStepProductID?: string;
  archivedAt?: string;
  name: string;
  measurementUnit: ValidMeasurementUnit;
  quantityNotes: string;
  minimumQuantity: number;
  maximumQuantity: number;
  ingredientNotes: string;
  belongsToRecipeStep: string;
  id: string;
  createdAt: string;
  productOfRecipeStep: boolean;
  optional: boolean;

  constructor(
    input: {
      lastUpdatedAt?: string;
      recipeStepProductID?: string;
      archivedAt?: string;
      quantityNotes?: string;
      measurementUnit?: ValidMeasurementUnit;
      name?: string;
      ingredientNotes?: string;
      id?: string;
      belongsToRecipeStep?: string;
      ingredient?: ValidIngredient;
      createdAt?: string;
      minimumQuantity?: number;
      maximumQuantity?: number;
      productOfRecipeStep?: boolean;
      optional?: boolean;
    } = {}
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.ingredient = input.ingredient;
    this.recipeStepProductID = input.recipeStepProductID;
    this.archivedAt = input.archivedAt;
    this.name = input.name || "";
    this.quantityNotes = input.quantityNotes || "";
    this.measurementUnit = input.measurementUnit;
    this.ingredientNotes = input.ingredientNotes || "";
    this.id = input.id || "";
    this.belongsToRecipeStep = input.belongsToRecipeStep || "";
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
    this.productOfRecipeStep = Boolean(input.productOfRecipeStep);
    this.optional = Boolean(input.optional);
  }
}

export class RecipeStepIngredientList extends QueryFilteredResult<RecipeStepIngredient> {
  constructor(
    input: {
      data?: RecipeStepIngredient[];
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

export class RecipeStepIngredientCreationRequestInput {
  name: string;
  ingredientID?: string;
  measurementUnitID?: string;
  quantityNotes: string;
  ingredientNotes: string;
  minimumQuantity: number;
  maximumQuantity: number;
  productOfRecipeStep: boolean;
  optional: boolean;

  constructor(
    input: {
      name?: string;
      ingredientID?: string;
      measurementUnitID?: string;
      quantityNotes?: string;
      ingredientNotes?: string;
      minimumQuantity?: number;
      maximumQuantity?: number;
      productOfRecipeStep?: boolean;
      optional?: boolean;
    } = {}
  ) {
    this.name = input.name || "";
    this.ingredientID = input.ingredientID || "";
    this.quantityNotes = input.quantityNotes || "";
    this.ingredientNotes = input.ingredientNotes || "";
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
    this.productOfRecipeStep = Boolean(input.productOfRecipeStep);
    this.measurementUnitID = input.measurementUnitID || "";
    this.optional = Boolean(input.optional);
  }

  static fromRecipeStepIngredient(
    input: RecipeStepIngredient
  ): RecipeStepIngredientCreationRequestInput {
    const x = new RecipeStepIngredientCreationRequestInput();

    x.name = input.name;
    x.ingredientID = input.ingredient.id;
    x.measurementUnitID = input.measurementUnit?.id;
    x.quantityNotes = input.quantityNotes;
    x.ingredientNotes = input.ingredientNotes;
    x.minimumQuantity = input.minimumQuantity;
    x.minimumQuantity = input.minimumQuantity;
    x.productOfRecipeStep = input.productOfRecipeStep;
    x.optional = Boolean(input.optional);

    return x;
  }
}

export class RecipeStepIngredientUpdateRequestInput {
  name?: string;
  ingredientID?: string;
  measurementUnitID?: string;
  quantityNotes?: string;
  ingredientNotes?: string;
  belongsToRecipeStep?: string;
  minimumQuantity?: number;
  maximumQuantity: number;
  productOfRecipeStep?: boolean;
  recipeStepProductID?: string;
  optional?: boolean;

  constructor(
    input: {
      name?: string;
      ingredientID?: string;
      measurementUnitID?: string;
      quantityNotes?: string;
      ingredientNotes?: string;
      belongsToRecipeStep?: string;
      minimumQuantity?: number;
      maximumQuantity?: number;
      productOfRecipeStep?: boolean;
      recipeStepProductID?: string;
      optional?: boolean;
    } = {}
  ) {
    this.name = input.name;
    this.ingredientID = input.ingredientID;
    this.measurementUnitID = input.measurementUnitID;
    this.quantityNotes = input.quantityNotes;
    this.ingredientNotes = input.ingredientNotes;
    this.belongsToRecipeStep = input.belongsToRecipeStep;
    this.minimumQuantity = input.minimumQuantity;
    this.maximumQuantity = input.maximumQuantity;
    this.productOfRecipeStep = input.productOfRecipeStep;
    this.recipeStepProductID = input.recipeStepProductID;
    this.optional = Boolean(input.optional);
  }

  static fromRecipeStepIngredient(
    input: RecipeStepIngredient
  ): RecipeStepIngredientUpdateRequestInput {
    const x = new RecipeStepIngredientUpdateRequestInput();

    x.name = input.name;
    x.ingredientID = input.ingredient.id;
    x.measurementUnitID = input.measurementUnit?.id;
    x.quantityNotes = input.quantityNotes;
    x.ingredientNotes = input.ingredientNotes;
    x.belongsToRecipeStep = input.belongsToRecipeStep;
    x.minimumQuantity = input.minimumQuantity;
    x.maximumQuantity = input.maximumQuantity;
    x.productOfRecipeStep = input.productOfRecipeStep;
    x.optional = Boolean(input.optional);

    return x;
  }
}
