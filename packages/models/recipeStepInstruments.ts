import { QueryFilteredResult } from './pagination';
import { ValidInstrument } from './validInstruments';

export class RecipeStepInstrument {
  archivedAt?: string;
  instrument?: ValidInstrument;
  lastUpdatedAt?: string;
  productOfRecipeStep: boolean;
  recipeStepProductID?: string;
  name: string;
  notes: string;
  preferenceRank: number;
  id: string;
  optional: boolean;
  minimumQuantity: number;
  maximumQuantity: number;
  belongsToRecipeStep: string;
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      instrument?: ValidInstrument;
      lastUpdatedAt?: string;
      productOfRecipeStep?: boolean;
      recipeStepProductID?: string;
      name?: string;
      notes?: string;
      preferenceRank?: number;
      id?: string;
      belongsToRecipeStep?: string;
      createdAt?: string;
      optional?: boolean;
      minimumQuantity?: number;
      maximumQuantity?: number;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.instrument = input.instrument;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.recipeStepProductID = input.recipeStepProductID;
    this.productOfRecipeStep = input.productOfRecipeStep || false;
    this.name = input.name || '';
    this.notes = input.notes || '';
    this.preferenceRank = input.preferenceRank || 0;
    this.id = input.id || '';
    this.optional = Boolean(input.optional);
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }
}

export class RecipeStepInstrumentList extends QueryFilteredResult<RecipeStepInstrument> {
  constructor(
    input: {
      data?: RecipeStepInstrument[];
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

export class RecipeStepInstrumentCreationRequestInput {
  instrumentID?: string;
  productOfRecipeStep: boolean;
  recipeStepProductID?: string;
  notes: string;
  name: string;
  preferenceRank: number;
  optional: boolean;
  minimumQuantity: number;
  maximumQuantity: number;

  constructor(
    input: {
      instrumentID?: string;
      productOfRecipeStep?: boolean;
      recipeStepProductID?: string;
      notes?: string;
      name?: string;
      preferenceRank?: number;
      optional?: boolean;
      minimumQuantity?: number;
      maximumQuantity?: number;
    } = {},
  ) {
    this.instrumentID = input.instrumentID;
    this.productOfRecipeStep = input.productOfRecipeStep || false;
    this.recipeStepProductID = input.recipeStepProductID;
    this.notes = input.notes || '';
    this.name = input.name || '';
    this.preferenceRank = input.preferenceRank || 0;
    this.optional = Boolean(input.optional);
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
  }

  static fromRecipeStepInstrument(input: RecipeStepInstrument): RecipeStepInstrumentCreationRequestInput {
    const output = new RecipeStepInstrumentCreationRequestInput();

    output.instrumentID = input.instrument?.id;
    output.productOfRecipeStep = input.productOfRecipeStep;
    output.recipeStepProductID = input.recipeStepProductID;
    output.notes = input.notes;
    output.preferenceRank = input.preferenceRank;
    output.optional = input.optional;
    output.minimumQuantity = input.minimumQuantity;
    output.maximumQuantity = input.maximumQuantity;

    return output;
  }
}

export class RecipeStepInstrumentUpdateRequestInput {
  instrumentID?: string;
  productOfRecipeStep?: boolean;
  recipeStepProductID?: string;
  notes?: string;
  name?: string;
  preferenceRank: number;
  belongsToRecipeStep?: string;
  optional?: boolean;
  minimumQuantity?: number;
  maximumQuantity?: number;

  constructor(
    input: {
      instrumentID?: string;
      productOfRecipeStep?: boolean;
      recipeStepProductID?: string;
      notes?: string;
      name?: string;
      preferenceRank?: number;
      belongsToRecipeStep?: string;
      optional?: boolean;
      minimumQuantity?: number;
      maximumQuantity?: number;
    } = {},
  ) {
    this.instrumentID = input.instrumentID;
    this.productOfRecipeStep = input.productOfRecipeStep;
    this.recipeStepProductID = input.recipeStepProductID;
    this.notes = input.notes;
    this.name = input.name;
    this.preferenceRank = input.preferenceRank || -1;
    this.belongsToRecipeStep = input.belongsToRecipeStep;
    this.optional = Boolean(input.optional);
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
  }

  static fromRecipeStepInstrument(input: RecipeStepInstrument): RecipeStepInstrumentUpdateRequestInput {
    const output = new RecipeStepInstrumentUpdateRequestInput();

    output.instrumentID = input.instrument?.id;
    output.productOfRecipeStep = input.productOfRecipeStep;
    output.recipeStepProductID = input.recipeStepProductID;
    output.notes = input.notes;
    output.name = input.name;
    output.preferenceRank = input.preferenceRank;
    output.belongsToRecipeStep = input.belongsToRecipeStep;
    output.optional = input.optional;
    output.minimumQuantity = input.minimumQuantity;
    output.maximumQuantity = input.maximumQuantity;

    return output;
  }
}
