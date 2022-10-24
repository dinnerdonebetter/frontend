import { QueryFilteredResult } from './pagination';
import { ValidIngredient } from './validIngredients';
import { ValidPreparation } from './validPreparations';

export class ValidIngredientPreparation {
  archivedAt?: string;
  lastUpdatedAt?: string;
  notes: string;
  preparation: ValidPreparation;
  ingredient: ValidIngredient;
  id: string;
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      notes?: string;
      preparation?: ValidPreparation;
      ingredient?: ValidIngredient;
      id?: string;
      createdAt?: string;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.notes = input.notes || '';
    this.preparation = input.preparation || new ValidPreparation();
    this.ingredient = input.ingredient || new ValidIngredient();
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }
}

export class ValidIngredientPreparationList extends QueryFilteredResult<ValidIngredientPreparation> {
  constructor(
    input: {
      data?: ValidIngredientPreparation[];
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

export class ValidIngredientPreparationCreationRequestInput {
  notes: string;
  validPreparationID: string;
  validIngredientID: string;

  constructor(
    input: {
      notes?: string;
      validPreparationID?: string;
      validIngredientID?: string;
    } = {},
  ) {
    this.notes = input.notes || '';
    this.validPreparationID = input.validPreparationID || '';
    this.validIngredientID = input.validIngredientID || '';
  }

  static fromValidIngredientPreparation(
    input: ValidIngredientPreparation,
  ): ValidIngredientPreparationCreationRequestInput {
    const x = new ValidIngredientPreparationCreationRequestInput();

    x.notes = input.notes;
    x.validPreparationID = input.preparation.id;
    x.validIngredientID = input.ingredient.id;

    return x;
  }
}

export class ValidIngredientPreparationUpdateRequestInput {
  notes?: string;
  validPreparationID?: string;
  validIngredientID?: string;

  constructor(
    input: {
      notes?: string;
      validPreparationID?: string;
      validIngredientID?: string;
    } = {},
  ) {
    this.notes = input.notes;
    this.validPreparationID = input.validPreparationID;
    this.validIngredientID = input.validIngredientID;
  }

  static fromValidIngredientPreparation(
    input: ValidIngredientPreparation,
  ): ValidIngredientPreparationUpdateRequestInput {
    const x = new ValidIngredientPreparationUpdateRequestInput();

    x.notes = input.notes;
    x.validPreparationID = input.preparation.id;
    x.validIngredientID = input.ingredient.id;

    return x;
  }
}
