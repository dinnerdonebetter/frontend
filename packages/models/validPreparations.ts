import { QueryFilteredResult } from './pagination';

export class ValidPreparation {
  archivedAt?: string;
  lastUpdatedAt?: string;
  name: string;
  description: string;
  iconPath: string;
  id: string;
  yieldsNothing: boolean;
  restrictToIngredients: boolean;
  pastTense: string;
  createdAt: string;
  slug: string;
  minimumIngredientCount: number;
  maximumIngredientCount?: number;
  minimumInstrumentCount: number;
  maximumInstrumentCount?: number;
  temperatureRequired: boolean;
  timeEstimateRequired: boolean;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      name?: string;
      description?: string;
      iconPath?: string;
      id?: string;
      yieldsNothing?: boolean;
      restrictToIngredients?: boolean;
      pastTense?: string;
      createdAt?: string;
      slug?: string;
      minimumIngredientCount?: number;
      maximumIngredientCount?: number;
      minimumInstrumentCount?: number;
      maximumInstrumentCount?: number;
      temperatureRequired?: boolean;
      timeEstimateRequired?: boolean;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.name = input.name || '';
    this.description = input.description || '';
    this.iconPath = input.iconPath || '';
    this.id = input.id || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.yieldsNothing = Boolean(input.yieldsNothing);
    this.restrictToIngredients = Boolean(input.restrictToIngredients);
    this.pastTense = input.pastTense || '';
    this.slug = input.slug || '';
    this.minimumIngredientCount = input.minimumIngredientCount || -1;
    this.maximumIngredientCount = input.maximumIngredientCount;
    this.minimumInstrumentCount = input.minimumInstrumentCount || -1;
    this.maximumInstrumentCount = input.maximumInstrumentCount;
    this.temperatureRequired = Boolean(input.temperatureRequired);
    this.timeEstimateRequired = Boolean(input.timeEstimateRequired);
  }
}

export class ValidPreparationList extends QueryFilteredResult<ValidPreparation> {
  constructor(
    input: {
      data?: ValidPreparation[];
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

export class ValidPreparationCreationRequestInput {
  name: string;
  description: string;
  iconPath: string;
  yieldsNothing: boolean;
  restrictToIngredients: boolean;
  pastTense: string;
  slug: string;
  minimumIngredientCount: number;
  maximumIngredientCount?: number;
  minimumInstrumentCount: number;
  maximumInstrumentCount?: number;
  temperatureRequired: boolean;
  timeEstimateRequired: boolean;

  constructor(
    input: {
      name?: string;
      description?: string;
      iconPath?: string;
      yieldsNothing?: boolean;
      restrictToIngredients?: boolean;
      pastTense?: string;
      slug?: string;
      minimumIngredientCount?: number;
      maximumIngredientCount?: number;
      minimumInstrumentCount?: number;
      maximumInstrumentCount?: number;
      temperatureRequired?: boolean;
      timeEstimateRequired?: boolean;
    } = {},
  ) {
    this.name = input.name || '';
    this.description = input.description || '';
    this.iconPath = input.iconPath || '';
    this.yieldsNothing = Boolean(input.yieldsNothing);
    this.restrictToIngredients = Boolean(input.restrictToIngredients);
    this.pastTense = input.pastTense || '';
    this.slug = input.slug || '';
    this.minimumIngredientCount = input.minimumIngredientCount || -1;
    this.maximumIngredientCount = input.maximumIngredientCount;
    this.minimumInstrumentCount = input.minimumInstrumentCount || -1;
    this.maximumInstrumentCount = input.maximumInstrumentCount;
    this.temperatureRequired = Boolean(input.temperatureRequired);
    this.timeEstimateRequired = Boolean(input.timeEstimateRequired);
  }

  static fromValidPreparation(input: ValidPreparation): ValidPreparationCreationRequestInput {
    const result = new ValidPreparationCreationRequestInput();

    result.name = input.name;
    result.description = input.description;
    result.iconPath = input.iconPath;
    result.yieldsNothing = input.yieldsNothing;
    result.restrictToIngredients = input.restrictToIngredients;
    result.pastTense = input.pastTense;
    result.minimumIngredientCount = input.minimumIngredientCount || -1;
    result.maximumIngredientCount = input.maximumIngredientCount;
    result.minimumInstrumentCount = input.minimumInstrumentCount || -1;
    result.maximumInstrumentCount = input.maximumInstrumentCount;
    result.temperatureRequired = Boolean(input.temperatureRequired);
    result.timeEstimateRequired = Boolean(input.timeEstimateRequired);

    return result;
  }
}

export class ValidPreparationUpdateRequestInput {
  name?: string;
  description?: string;
  iconPath?: string;
  yieldsNothing?: boolean;
  restrictToIngredients?: boolean;
  pastTense?: string;
  slug: string;
  minimumIngredientCount?: number;
  maximumIngredientCount?: number;
  minimumInstrumentCount?: number;
  maximumInstrumentCount?: number;
  temperatureRequired?: boolean;
  timeEstimateRequired?: boolean;

  constructor(
    input: {
      name?: string;
      description?: string;
      iconPath?: string;
      yieldsNothing?: boolean;
      restrictToIngredients?: boolean;
      pastTense?: string;
      slug?: string;
      minimumIngredientCount?: number;
      maximumIngredientCount?: number;
      minimumInstrumentCount?: number;
      maximumInstrumentCount?: number;
      temperatureRequired?: boolean;
      timeEstimateRequired?: boolean;
    } = {},
  ) {
    this.name = input.name;
    this.description = input.description;
    this.iconPath = input.iconPath;
    this.yieldsNothing = Boolean(input.yieldsNothing);
    this.restrictToIngredients = Boolean(input.restrictToIngredients);
    this.pastTense = input.pastTense || '';
    this.slug = input.slug || '';
    this.minimumIngredientCount = input.minimumIngredientCount || -1;
    this.maximumIngredientCount = input.maximumIngredientCount;
    this.minimumInstrumentCount = input.minimumInstrumentCount || -1;
    this.maximumInstrumentCount = input.maximumInstrumentCount;
    this.temperatureRequired = Boolean(input.temperatureRequired);
    this.timeEstimateRequired = Boolean(input.timeEstimateRequired);
  }

  static fromValidPreparation(input: ValidPreparation): ValidPreparationUpdateRequestInput {
    const result = new ValidPreparationUpdateRequestInput();

    result.name = input.name;
    result.description = input.description;
    result.iconPath = input.iconPath;
    result.yieldsNothing = input.yieldsNothing;
    result.restrictToIngredients = input.restrictToIngredients;
    result.pastTense = input.pastTense;
    result.slug = input.slug;
    result.minimumIngredientCount = input.minimumIngredientCount || -1;
    result.maximumIngredientCount = input.maximumIngredientCount;
    result.minimumInstrumentCount = input.minimumInstrumentCount || -1;
    result.maximumInstrumentCount = input.maximumInstrumentCount;
    result.temperatureRequired = Boolean(input.temperatureRequired);
    result.timeEstimateRequired = Boolean(input.timeEstimateRequired);

    return result;
  }
}
