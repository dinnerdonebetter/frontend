import { QueryFilteredResult } from "./pagination";
import { ValidIngredient } from "./validIngredients";
import { ValidMeasurementUnit } from "./validMeasurementUnits";

export class ValidIngredientMeasurementUnit {
  archivedAt?: string;
  lastUpdatedAt?: string;
  notes: string;
  measurementUnit: ValidMeasurementUnit;
  ingredient: ValidIngredient;
  id: string;
  minimumAllowableQuantity: number;
  maximumAllowableQuantity: number;
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      notes?: string;
      measurementUnit?: ValidMeasurementUnit;
      ingredient?: ValidIngredient;
      id?: string;
      minimumAllowableQuantity?: number;
      maximumAllowableQuantity?: number;
      createdAt?: string;
    } = {}
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.notes = input.notes || "";
    this.measurementUnit = input.measurementUnit || new ValidMeasurementUnit();
    this.ingredient = input.ingredient || new ValidIngredient();
    this.id = input.id || "";
    this.minimumAllowableQuantity = input.minimumAllowableQuantity || 0;
    this.maximumAllowableQuantity = input.maximumAllowableQuantity || 0;
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
  }
}

export class ValidIngredientMeasurementUnitList extends QueryFilteredResult<ValidIngredientMeasurementUnit> {
  constructor(
    input: {
      data?: ValidIngredientMeasurementUnit[];
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

export class ValidIngredientMeasurementUnitCreationRequestInput {
  notes: string;
  validMeasurementUnitID: string;
  validIngredientID: string;
  minimumAllowableQuantity: number;
  maximumAllowableQuantity: number;

  constructor(
    input: {
      notes?: string;
      validMeasurementUnitID?: string;
      validIngredientID?: string;
      minimumAllowableQuantity?: number;
      maximumAllowableQuantity?: number;
    } = {}
  ) {
    this.notes = input.notes || "";
    this.validMeasurementUnitID = input.validMeasurementUnitID || "";
    this.validIngredientID = input.validIngredientID || "";
    this.minimumAllowableQuantity = input.minimumAllowableQuantity || 0;
    this.maximumAllowableQuantity = input.maximumAllowableQuantity || 0;
  }

  static fromValidIngredientMeasurementUnit(
    input: ValidIngredientMeasurementUnit
  ): ValidIngredientMeasurementUnitCreationRequestInput {
    const x = new ValidIngredientMeasurementUnitCreationRequestInput();

    x.notes = input.notes;
    x.validMeasurementUnitID = input.measurementUnit?.id;
    x.validIngredientID = input.ingredient?.id;
    x.minimumAllowableQuantity = input.minimumAllowableQuantity || 0;
    x.maximumAllowableQuantity = input.maximumAllowableQuantity || 0;

    return x;
  }
}

export class ValidIngredientMeasurementUnitUpdateRequestInput {
  notes?: string;
  validMeasurementUnitID?: string;
  validIngredientID?: string;
  minimumAllowableQuantity?: number;
  maximumAllowableQuantity?: number;

  constructor(
    input: {
      notes?: string;
      validMeasurementUnitID?: string;
      validIngredientID?: string;
      minimumAllowableQuantity?: number;
      maximumAllowableQuantity?: number;
    } = {}
  ) {
    this.notes = input.notes;
    this.validMeasurementUnitID = input.validMeasurementUnitID;
    this.validIngredientID = input.validIngredientID;
    this.minimumAllowableQuantity = input.minimumAllowableQuantity || 0;
    this.maximumAllowableQuantity = input.maximumAllowableQuantity || 0;
  }

  static fromValidIngredientMeasurementUnit(
    input: ValidIngredientMeasurementUnit
  ): ValidIngredientMeasurementUnitUpdateRequestInput {
    const x = new ValidIngredientMeasurementUnitUpdateRequestInput();

    x.notes = input.notes;
    x.validMeasurementUnitID = input.measurementUnit?.id;
    x.validIngredientID = input.ingredient?.id;
    x.minimumAllowableQuantity = input.minimumAllowableQuantity || 0;
    x.maximumAllowableQuantity = input.maximumAllowableQuantity || 0;

    return x;
  }
}
