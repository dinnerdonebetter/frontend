import { QueryFilteredResult } from './pagination';

export class RecipeMedia {
  id: string;
  createdAt: string;
  lastUpdatedAt?: string;
  archivedAt?: string;
  belongsToRecipe?: string;
  belongsToRecipeStep?: string;
  mimeType: string;
  internalPath: string;
  externalPath: string;
  index: number;

  constructor(
    input: {
      id?: string;
      createdAt?: string;
      lastUpdatedAt?: string;
      archivedAt?: string;
      belongsToRecipe?: string;
      belongsToRecipeStep?: string;
      mimeType?: string;
      internalPath?: string;
      externalPath?: string;
      index?: number;
    } = {},
  ) {
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.belongsToRecipe = input.belongsToRecipe || '';
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.mimeType = input.mimeType || '';
    this.internalPath = input.internalPath || '';
    this.externalPath = input.externalPath || '';
    this.index = input.index || -1;
  }
}

export class RecipeMediaList extends QueryFilteredResult<RecipeMedia> {
  constructor(
    input: {
      data?: RecipeMedia[];
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

export class RecipeMediaCreationRequestInput {
  belongsToRecipe?: string;
  belongsToRecipeStep?: string;
  mimeType: string;
  internalPath: string;
  externalPath: string;
  index: number;

  constructor(
    input: {
      belongsToRecipe?: string;
      belongsToRecipeStep?: string;
      mimeType?: string;
      internalPath?: string;
      externalPath?: string;
      index?: number;
    } = {},
  ) {
    this.belongsToRecipe = input.belongsToRecipe || '';
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.mimeType = input.mimeType || '';
    this.internalPath = input.internalPath || '';
    this.externalPath = input.externalPath || '';
    this.index = input.index || -1;
  }

  static fromRecipeMedia(input: RecipeMedia): RecipeMediaCreationRequestInput {
    const result = new RecipeMediaCreationRequestInput();

    result.belongsToRecipe = input.belongsToRecipe || '';
    result.belongsToRecipeStep = input.belongsToRecipeStep || '';
    result.mimeType = input.mimeType || '';
    result.internalPath = input.internalPath || '';
    result.externalPath = input.externalPath || '';
    result.index = input.index || -1;

    return result;
  }
}

export class RecipeMediaUpdateRequestInput {
  belongsToRecipe?: string;
  belongsToRecipeStep?: string;
  mimeType: string;
  internalPath: string;
  externalPath: string;
  index: number;

  constructor(
    input: {
      belongsToRecipe?: string;
      belongsToRecipeStep?: string;
      mimeType?: string;
      internalPath?: string;
      externalPath?: string;
      index?: number;
    } = {},
  ) {
    this.belongsToRecipe = input.belongsToRecipe || '';
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.mimeType = input.mimeType || '';
    this.internalPath = input.internalPath || '';
    this.externalPath = input.externalPath || '';
    this.index = input.index || -1;
  }

  static fromRecipeMedia(input: RecipeMedia): RecipeMediaUpdateRequestInput {
    const result = new RecipeMediaUpdateRequestInput();

    result.belongsToRecipe = input.belongsToRecipe || '';
    result.belongsToRecipeStep = input.belongsToRecipeStep || '';
    result.mimeType = input.mimeType || '';
    result.internalPath = input.internalPath || '';
    result.externalPath = input.externalPath || '';
    result.index = input.index || -1;

    return result;
  }
}
