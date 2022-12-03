import { QueryFilteredResult } from './pagination';

export class ValidIngredientState {
  createdAt: string;
  archivedAt?: string;
  lastUpdatedAt?: string;
  pastTense: string;
  description: string;
  iconPath: string;
  id: string;
  name: string;
  slug: string;

  constructor(
    input: {
      createdAt?: string;
      archivedAt?: string;
      lastUpdatedAt?: string;
      pastTense?: string;
      description?: string;
      iconPath?: string;
      id?: string;
      name?: string;
      slug?: string;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.name = input.name || '';
    this.pastTense = input.pastTense || '';
    this.description = input.description || '';
    this.id = input.id || '';
    this.iconPath = input.iconPath || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.slug = input.slug || '';
  }
}

export class ValidIngredientStateList extends QueryFilteredResult<ValidIngredientState> {
  constructor(
    input: {
      data?: ValidIngredientState[];
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

export class ValidIngredientStateCreationRequestInput {
  pastTense: string;
  description: string;
  iconPath: string;
  name: string;
  slug: string;

  constructor(
    input: {
      pastTense?: string;
      description?: string;
      iconPath?: string;
      name?: string;
      slug?: string;
    } = {},
  ) {
    this.name = input.name || '';
    this.pastTense = input.pastTense || '';
    this.description = input.description || '';
    this.iconPath = input.iconPath || '';
    this.slug = input.slug || '';
  }

  static fromValidIngredientState(input: ValidIngredientState): ValidIngredientStateCreationRequestInput {
    const x = new ValidIngredientStateCreationRequestInput();

    x.name = input.name;
    x.pastTense = input.pastTense;
    x.description = input.description;
    x.iconPath = input.iconPath;
    x.slug = input.slug;

    return x;
  }
}

export class ValidIngredientStateUpdateRequestInput {
  pastTense?: string;
  description?: string;
  iconPath?: string;
  name?: string;
  slug?: string;

  constructor(
    input: {
      pastTense?: string;
      description?: string;
      iconPath?: string;
      name?: string;
      slug?: string;
    } = {},
  ) {
    this.name = input.name;
    this.pastTense = input.pastTense || '';
    this.description = input.description;
    this.iconPath = input.iconPath;
    this.slug = input.slug;
  }

  static fromValidIngredientState(input: ValidIngredientState): ValidIngredientStateUpdateRequestInput {
    const x = new ValidIngredientStateUpdateRequestInput();

    x.name = input.name;
    x.pastTense = input.pastTense;
    x.description = input.description;
    x.iconPath = input.iconPath;
    x.slug = input.slug;

    return x;
  }
}
