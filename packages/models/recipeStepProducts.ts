import { QueryFilteredResult } from './pagination';
import { ValidMeasurementUnit } from './validMeasurementUnits';

export type ValidRecipeStepProductType = 'instrument' | 'ingredient';

export class RecipeStepProduct {
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: string;
  name: string;
  type: ValidRecipeStepProductType;
  measurementUnit: ValidMeasurementUnit;
  quantityNotes: string;
  minimumQuantity: number;
  maximumQuantity: number;
  belongsToRecipeStep: string;
  compostable: boolean;
  maximumStorageDurationInSeconds: number;
  minimumStorageTemperatureInCelsius?: number;
  maximumStorageTemperatureInCelsius?: number;
  createdAt: string;
  isWaste: boolean;
  isLiquid: boolean;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      id?: string;
      name?: string;
      type?: ValidRecipeStepProductType;
      measurementUnit?: ValidMeasurementUnit;
      quantityNotes?: string;
      minimumQuantity?: number;
      maximumQuantity?: number;
      belongsToRecipeStep?: string;
      compostable?: boolean;
      maximumStorageDurationInSeconds?: number;
      minimumStorageTemperatureInCelsius?: number;
      maximumStorageTemperatureInCelsius?: number;
      createdAt?: string;
      isWaste?: boolean;
      isLiquid?: boolean;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id || '';
    this.name = input.name || '';
    this.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    this.type = input.type || 'ingredient';
    this.quantityNotes = input.quantityNotes || '';
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
    this.belongsToRecipeStep = input.belongsToRecipeStep || '';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.compostable = Boolean(input.compostable);
    this.maximumStorageDurationInSeconds = input.maximumStorageDurationInSeconds || 0;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius;
    this.isWaste = Boolean(input.isWaste);
    this.isLiquid = Boolean(input.isLiquid);
  }
}

export class RecipeStepProductList extends QueryFilteredResult<RecipeStepProduct> {
  constructor(
    input: {
      data?: RecipeStepProduct[];
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

export class RecipeStepProductCreationRequestInput {
  name: string;
  type: ValidRecipeStepProductType;
  measurementUnitID: string;
  quantityNotes: string;
  minimumQuantity: number;
  maximumQuantity: number;
  compostable: boolean;
  maximumStorageDurationInSeconds: number;
  minimumStorageTemperatureInCelsius?: number;
  maximumStorageTemperatureInCelsius?: number;
  isWaste: boolean;
  isLiquid: boolean;

  constructor(
    input: {
      name?: string;
      type?: ValidRecipeStepProductType;
      measurementUnitID?: string;
      quantityNotes?: string;
      minimumQuantity?: number;
      maximumQuantity?: number;
      compostable?: boolean;
      maximumStorageDurationInSeconds?: number;
      minimumStorageTemperatureInCelsius?: number;
      maximumStorageTemperatureInCelsius?: number;
      isWaste?: boolean;
      isLiquid?: boolean;
    } = {},
  ) {
    this.name = input.name || '';
    this.type = input.type || 'ingredient';
    this.measurementUnitID = input.measurementUnitID || '';
    this.quantityNotes = input.quantityNotes || '';
    this.minimumQuantity = input.minimumQuantity || 0;
    this.maximumQuantity = input.maximumQuantity || 0;
    this.compostable = Boolean(input.compostable);
    this.maximumStorageDurationInSeconds = input.maximumStorageDurationInSeconds || 0;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius;
    this.isWaste = Boolean(input.isWaste);
    this.isLiquid = Boolean(input.isLiquid);
  }

  static fromRecipeStepProduct(input: RecipeStepProduct): RecipeStepProductCreationRequestInput {
    const x = new RecipeStepProductCreationRequestInput();

    x.name = input.name;
    x.type = input.type;
    x.measurementUnitID = input.measurementUnit.id;
    x.quantityNotes = input.quantityNotes;
    x.minimumQuantity = input.minimumQuantity;
    x.maximumQuantity = input.maximumQuantity;
    x.compostable = input.compostable;
    x.maximumStorageDurationInSeconds = input.maximumStorageDurationInSeconds;
    x.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius;
    x.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius;
    x.isWaste = input.isWaste;
    x.isLiquid = input.isLiquid;

    return x;
  }
}

export class RecipeStepProductUpdateRequestInput {
  name?: string;
  type?: ValidRecipeStepProductType;
  measurementUnitID: string;
  quantityNotes?: string;
  minimumQuantity?: number;
  maximumQuantity: number;
  belongsToRecipeStep?: string;
  compostable?: boolean;
  maximumStorageDurationInSeconds?: number;
  minimumStorageTemperatureInCelsius?: number;
  maximumStorageTemperatureInCelsius?: number;
  isWaste: boolean;
  isLiquid: boolean;

  constructor(
    input: {
      name?: string;
      type?: ValidRecipeStepProductType;
      measurementUnitID?: string;
      quantityNotes?: string;
      minimumQuantity?: number;
      maximumQuantity?: number;
      belongsToRecipeStep?: string;
      compostable?: boolean;
      maximumStorageDurationInSeconds?: number;
      minimumStorageTemperatureInCelsius?: number;
      maximumStorageTemperatureInCelsius?: number;
      isWaste?: boolean;
      isLiquid?: boolean;
    } = {},
  ) {
    this.name = input.name;
    this.type = input.type || 'ingredient';
    this.measurementUnitID = input.measurementUnitID || '';
    this.quantityNotes = input.quantityNotes;
    this.minimumQuantity = input.minimumQuantity;
    this.maximumQuantity = input.maximumQuantity || -1;
    this.belongsToRecipeStep = input.belongsToRecipeStep;
    this.compostable = Boolean(input.compostable);
    this.maximumStorageDurationInSeconds = input.maximumStorageDurationInSeconds || 0;
    this.minimumStorageTemperatureInCelsius = input.minimumStorageTemperatureInCelsius || 0;
    this.maximumStorageTemperatureInCelsius = input.maximumStorageTemperatureInCelsius || 0;
    this.isWaste = Boolean(input.isWaste);
    this.isLiquid = Boolean(input.isLiquid);
  }

  static fromRecipeStepProduct(input: RecipeStepProduct): RecipeStepProductUpdateRequestInput {
    return new RecipeStepProductUpdateRequestInput({
      name: input.name,
      type: input.type,
      measurementUnitID: input.measurementUnit.id,
      quantityNotes: input.quantityNotes,
      minimumQuantity: input.minimumQuantity,
      maximumQuantity: input.maximumQuantity,
      belongsToRecipeStep: input.belongsToRecipeStep,
      compostable: input.compostable,
      maximumStorageDurationInSeconds: input.maximumStorageDurationInSeconds || 0,
      minimumStorageTemperatureInCelsius: input.minimumStorageTemperatureInCelsius || 0,
      maximumStorageTemperatureInCelsius: input.maximumStorageTemperatureInCelsius || 0,
      isWaste: input.isWaste,
      isLiquid: input.isLiquid,
    });
  }
}
