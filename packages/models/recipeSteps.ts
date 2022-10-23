import { QueryFilteredResult } from "./pagination";
import { ValidPreparation } from "./validPreparations";
import {
  RecipeStepProduct,
  RecipeStepProductCreationRequestInput,
} from "./recipeStepProducts";
import {
  RecipeStepIngredient,
  RecipeStepIngredientCreationRequestInput,
} from "./recipeStepIngredients";
import {
  RecipeStepInstrument,
  RecipeStepInstrumentCreationRequestInput,
} from "./recipeStepInstruments";

export class RecipeStep {
  lastUpdatedAt?: string;
  minimumTemperatureInCelsius?: number;
  maximumTemperatureInCelsius?: number;
  archivedAt?: string;
  belongsToRecipe: string;
  notes: string;
  id: string;
  preparation: ValidPreparation;
  instruments: RecipeStepInstrument[];
  products: RecipeStepProduct[];
  ingredients: RecipeStepIngredient[];
  index: number;
  createdAt: string;
  maximumEstimatedTimeInSeconds?: number;
  minimumEstimatedTimeInSeconds?: number;
  optional: boolean;
  explicitInstructions: string;

  constructor(
    input: {
      lastUpdatedAt?: string;
      minimumTemperatureInCelsius?: number;
      maximumTemperatureInCelsius?: number;
      archivedAt?: string;
      belongsToRecipe?: string;
      notes?: string;
      id?: string;
      preparation?: ValidPreparation;
      instruments?: RecipeStepInstrument[];
      products?: RecipeStepProduct[];
      ingredients?: RecipeStepIngredient[];
      index?: number;
      createdAt?: string;
      maximumEstimatedTimeInSeconds?: number;
      minimumEstimatedTimeInSeconds?: number;
      optional?: boolean;
      explicitInstructions?: string;
    } = {}
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.minimumTemperatureInCelsius = input.minimumTemperatureInCelsius;
    this.maximumTemperatureInCelsius = input.maximumTemperatureInCelsius;
    this.archivedAt = input.archivedAt;
    this.belongsToRecipe = input.belongsToRecipe || "";
    this.notes = input.notes || "";
    this.id = input.id || "";
    this.preparation = input.preparation;
    this.instruments = input.instruments || [];
    this.products = input.products || [];
    this.ingredients = input.ingredients || [];
    this.index = input.index || -1;
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.maximumEstimatedTimeInSeconds = input.maximumEstimatedTimeInSeconds;
    this.minimumEstimatedTimeInSeconds = input.minimumEstimatedTimeInSeconds;
    this.optional = Boolean(input.optional);
    this.explicitInstructions = input.explicitInstructions;
  }
}

export class RecipeStepList extends QueryFilteredResult<RecipeStep> {
  constructor(
    input: {
      data?: RecipeStep[];
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

export class RecipeStepCreationRequestInput {
  minimumTemperatureInCelsius?: number;
  maximumTemperatureInCelsius?: number;
  notes: string;
  preparationID: string;
  products: RecipeStepProductCreationRequestInput[];
  instruments: RecipeStepInstrumentCreationRequestInput[];
  ingredients: RecipeStepIngredientCreationRequestInput[];
  index: number;
  minimumEstimatedTimeInSeconds?: number;
  maximumEstimatedTimeInSeconds?: number;
  optional: boolean;
  explicitInstructions: string;

  constructor(
    input: {
      minimumTemperatureInCelsius?: number;
      maximumTemperatureInCelsius?: number;
      notes?: string;
      preparationID?: string;
      products?: RecipeStepProductCreationRequestInput[];
      instruments?: RecipeStepInstrumentCreationRequestInput[];
      ingredients?: RecipeStepIngredientCreationRequestInput[];
      index?: number;
      prerequisiteStep?: number;
      minimumEstimatedTimeInSeconds?: number;
      maximumEstimatedTimeInSeconds?: number;
      optional?: boolean;
      explicitInstructions?: string;
    } = {}
  ) {
    this.minimumTemperatureInCelsius = input.minimumTemperatureInCelsius;
    this.maximumTemperatureInCelsius = input.maximumTemperatureInCelsius;
    this.notes = input.notes || "";
    this.preparationID = input.preparationID || "";
    this.products = input.products || [];
    this.instruments = input.instruments || [];
    this.ingredients = input.ingredients || [];
    this.index = input.index || -1;
    this.minimumEstimatedTimeInSeconds = input.minimumEstimatedTimeInSeconds;
    this.maximumEstimatedTimeInSeconds = input.maximumEstimatedTimeInSeconds;
    this.optional = Boolean(input.optional);
    this.explicitInstructions = input.explicitInstructions;
  }

  static fromRecipeStep(input: RecipeStep): RecipeStepCreationRequestInput {
    const x = new RecipeStepCreationRequestInput();

    x.minimumTemperatureInCelsius = input.minimumTemperatureInCelsius;
    x.maximumTemperatureInCelsius = input.maximumTemperatureInCelsius;
    x.notes = input.notes;
    x.preparationID = input.preparation.id;
    x.products = x.products || [];
    x.instruments = x.instruments || [];
    x.ingredients = x.ingredients || [];
    x.index = input.index;
    x.minimumEstimatedTimeInSeconds = input.minimumEstimatedTimeInSeconds;
    x.maximumEstimatedTimeInSeconds = input.maximumEstimatedTimeInSeconds;
    x.optional = input.optional;
    x.explicitInstructions = input.explicitInstructions;

    return x;
  }
}

export class RecipeStepUpdateRequestInput {
  minimumTemperatureInCelsius?: number;
  maximumTemperatureInCelsius?: number;
  notes?: string;
  belongsToRecipe?: string;
  products?: RecipeStepProduct[];
  preparation?: ValidPreparation;
  index?: number;
  minimumEstimatedTimeInSeconds?: number;
  maximumEstimatedTimeInSeconds?: number;
  optional?: boolean;
  explicitInstructions?: string;

  constructor(
    input: {
      minimumTemperatureInCelsius?: number;
      maximumTemperatureInCelsius?: number;
      notes?: string;
      belongsToRecipe?: string;
      products?: RecipeStepProduct[];
      preparation?: ValidPreparation;
      index?: number;
      minimumEstimatedTimeInSeconds?: number;
      maximumEstimatedTimeInSeconds?: number;
      optional?: boolean;
      explicitInstructions?: string;
    } = {}
  ) {
    this.minimumTemperatureInCelsius = input.minimumTemperatureInCelsius;
    this.maximumTemperatureInCelsius = input.maximumTemperatureInCelsius;
    this.notes = input.notes;
    this.belongsToRecipe = input.belongsToRecipe;
    this.products = input.products;
    this.preparation = input.preparation;
    this.index = input.index;
    this.minimumEstimatedTimeInSeconds = input.minimumEstimatedTimeInSeconds;
    this.maximumEstimatedTimeInSeconds = input.maximumEstimatedTimeInSeconds;
    this.optional = input.optional;
    this.explicitInstructions = input.explicitInstructions;
  }

  static fromRecipeStep(input: RecipeStep): RecipeStepUpdateRequestInput {
    const x = new RecipeStepUpdateRequestInput();

    x.minimumTemperatureInCelsius = input.minimumTemperatureInCelsius;
    x.maximumTemperatureInCelsius = input.maximumTemperatureInCelsius;
    x.notes = input.notes;
    x.belongsToRecipe = input.belongsToRecipe;
    x.products = input.products;
    x.preparation = input.preparation;
    x.index = input.index;
    x.minimumEstimatedTimeInSeconds = input.minimumEstimatedTimeInSeconds;
    x.maximumEstimatedTimeInSeconds = input.maximumEstimatedTimeInSeconds;
    x.optional = input.optional;
    x.explicitInstructions = input.explicitInstructions;

    return x;
  }
}
