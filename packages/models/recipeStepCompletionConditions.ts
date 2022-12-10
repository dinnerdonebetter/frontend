import { ValidIngredientState } from './validIngredientStates';
import { QueryFilteredResult } from './pagination';

export class RecipeStepCompletionCondition {
  lastUpdatedAt?: string;
  createdAt: string;
  archivedAt?: string;
  id: string;
  optional: boolean;
  belongsToRecipeStep: string;
  ingredientState: ValidIngredientState;
  notes: string;
  ingredients: RecipeStepCompletionConditionIngredient[];

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      id?: string;
      belongsToRecipeStep?: string;
      ingredientState?: ValidIngredientState;
      createdAt?: string;
      optional?: boolean;
      notes?: string;
      ingredients?: RecipeStepCompletionConditionIngredient[];
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.optional = Boolean(input.optional);
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.ingredientState = input.ingredientState || new ValidIngredientState();
    this.notes = input.notes || '';
    this.ingredients = input.ingredients || [];
  }
}

export class RecipeStepCompletionConditionIngredient {
  lastUpdatedAt?: string;
  createdAt: string;
  archivedAt?: string;
  id: string;
  belongsToRecipeStepCompletionCondition: string;
  recipeStepIngredient: string;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      createdAt?: string;
      id?: string;
      belongsToRecipeStepCompletionCondition?: string;
      recipeStepIngredient?: string;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.belongsToRecipeStepCompletionCondition = input.belongsToRecipeStepCompletionCondition || '';
    this.recipeStepIngredient = input.recipeStepIngredient || '';
  }
}

export class RecipeStepCompletionConditionList extends QueryFilteredResult<RecipeStepCompletionCondition> {
  constructor(
    input: {
      data?: RecipeStepCompletionCondition[];
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

export class RecipeStepCompletionConditionCreationRequestInput {
  optional: boolean;
  belongsToRecipeStep: string;
  ingredientStateID: string;
  notes: string;
  ingredients: number[];

  constructor(
    input: {
      optional?: boolean;
      belongsToRecipeStep?: string;
      ingredientStateID?: string;
      notes?: string;
      ingredients?: number[];
    } = {},
  ) {
    this.optional = Boolean(input.optional);
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.ingredientStateID = input.ingredientStateID || '';
    this.notes = input.notes || '';
    this.ingredients = input.ingredients || [];
  }

  static fromRecipeStepCompletionCondition(
    input: RecipeStepCompletionCondition,
  ): RecipeStepCompletionConditionCreationRequestInput {
    const x = new RecipeStepCompletionConditionCreationRequestInput();

    x.optional = Boolean(input.optional);
    x.belongsToRecipeStep = input.belongsToRecipeStep;
    x.ingredientStateID = input.ingredientState.id;
    x.notes = input.notes;

    return x;
  }
}

export class RecipeStepCompletionConditionIngredientCreationRequestInput {
  belongsToRecipeStepCompletionCondition: string;
  recipeStepIngredient: string;

  constructor(
    input: {
      belongsToRecipeStepCompletionCondition?: string;
      recipeStepIngredient?: string;
    } = {},
  ) {
    this.belongsToRecipeStepCompletionCondition = input.belongsToRecipeStepCompletionCondition || '';
    this.recipeStepIngredient = input.recipeStepIngredient || '';
  }
}

export class RecipeStepCompletionConditionUpdateRequestInput {
  optional: boolean;
  belongsToRecipeStep: string;
  ingredientStateID: string;
  notes: string;

  constructor(
    input: {
      optional?: boolean;
      belongsToRecipeStep?: string;
      ingredientStateID?: string;
      notes?: string;
    } = {},
  ) {
    this.optional = Boolean(input.optional);
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.ingredientStateID = input.ingredientStateID || '';
    this.notes = input.notes || '';
  }

  static fromRecipeStepCompletionCondition(
    input: RecipeStepCompletionCondition,
  ): RecipeStepCompletionConditionUpdateRequestInput {
    const x = new RecipeStepCompletionConditionUpdateRequestInput();

    x.optional = Boolean(input.optional);
    x.belongsToRecipeStep = input.belongsToRecipeStep;
    x.ingredientStateID = input.ingredientState.id;
    x.notes = input.notes;

    return x;
  }
}
