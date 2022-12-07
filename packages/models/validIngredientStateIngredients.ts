import { QueryFilteredResult } from './pagination';
import { ValidIngredient } from './validIngredients';
import { ValidIngredientState } from './validIngredientStates';

export class ValidIngredientStateIngredient {
  archivedAt?: string;
  lastUpdatedAt?: string;
  notes: string;
  ingredientState: ValidIngredientState;
  ingredient: ValidIngredient;
  id: string;
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      notes?: string;
      ingredientState?: ValidIngredientState;
      ingredient?: ValidIngredient;
      id?: string;
      createdAt?: string;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.notes = input.notes || '';
    this.ingredientState = input.ingredientState || new ValidIngredientState();
    this.ingredient = input.ingredient || new ValidIngredient();
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }
}

export class ValidIngredientStateIngredientList extends QueryFilteredResult<ValidIngredientStateIngredient> {
  constructor(
    input: {
      data?: ValidIngredientStateIngredient[];
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

export class ValidIngredientStateIngredientCreationRequestInput {
  notes: string;
  validIngredientStateID: string;
  validIngredientID: string;

  constructor(
    input: {
      notes?: string;
      validIngredientStateID?: string;
      validIngredientID?: string;
    } = {},
  ) {
    this.notes = input.notes || '';
    this.validIngredientStateID = input.validIngredientStateID || '';
    this.validIngredientID = input.validIngredientID || '';
  }

  static fromValidIngredientStateIngredient(
    input: ValidIngredientStateIngredient,
  ): ValidIngredientStateIngredientCreationRequestInput {
    const x = new ValidIngredientStateIngredientCreationRequestInput();

    x.notes = input.notes;
    x.validIngredientStateID = input.ingredientState.id;
    x.validIngredientID = input.ingredient.id;

    return x;
  }
}

export class ValidIngredientStateIngredientUpdateRequestInput {
  notes?: string;
  validIngredientStateID?: string;
  validIngredientID?: string;

  constructor(
    input: {
      notes?: string;
      validIngredientStateID?: string;
      validIngredientID?: string;
    } = {},
  ) {
    this.notes = input.notes;
    this.validIngredientStateID = input.validIngredientStateID;
    this.validIngredientID = input.validIngredientID;
  }

  static fromValidIngredientStateIngredient(
    input: ValidIngredientStateIngredient,
  ): ValidIngredientStateIngredientUpdateRequestInput {
    const x = new ValidIngredientStateIngredientUpdateRequestInput();

    x.notes = input.notes;
    x.validIngredientStateID = input.ingredientState.id;
    x.validIngredientID = input.ingredient.id;

    return x;
  }
}
