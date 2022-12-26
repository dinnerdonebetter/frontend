// Code generated by gen_typescript. DO NOT EDIT.

import { ValidMeasurementUnit } from './validMeasurementUnits';
import { ValidIngredient } from './validIngredients';

export interface IValidMeasurementUnitConversion {
  createdAt: NonNullable<string>;
  lastUpdatedAt?: string;
  archivedAt?: string;
  onlyForIngredient?: ValidIngredient;
  notes: NonNullable<string>;
  id: NonNullable<string>;
  from: NonNullable<ValidMeasurementUnit>;
  to: NonNullable<ValidMeasurementUnit>;
  modifier: NonNullable<number>;
}

export class ValidMeasurementUnitConversion implements IValidMeasurementUnitConversion {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  lastUpdatedAt?: string;
  archivedAt?: string;
  onlyForIngredient?: ValidIngredient = new ValidIngredient();
  notes: NonNullable<string> = '';
  id: NonNullable<string> = '';
  from: NonNullable<ValidMeasurementUnit> = new ValidMeasurementUnit();
  to: NonNullable<ValidMeasurementUnit> = new ValidMeasurementUnit();
  modifier: NonNullable<number> = 0;

  constructor(
    input: {
      createdAt?: string;
      lastUpdatedAt?: string;
      archivedAt?: string;
      onlyForIngredient?: ValidIngredient;
      notes?: string;
      id?: string;
      from?: ValidMeasurementUnit;
      to?: ValidMeasurementUnit;
      modifier?: number;
    } = {},
  ) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.onlyForIngredient = input.onlyForIngredient ?? new ValidIngredient();
    this.notes = input.notes ?? '';
    this.id = input.id ?? '';
    this.from = input.from ?? new ValidMeasurementUnit();
    this.to = input.to ?? new ValidMeasurementUnit();
    this.modifier = input.modifier ?? 0;
  }
}

export interface IValidMeasurementUnitConversionCreationRequestInput {
  onlyForIngredient?: string;
  from: NonNullable<string>;
  to: NonNullable<string>;
  notes: NonNullable<string>;
  modifier: NonNullable<number>;
}

export class ValidMeasurementUnitConversionCreationRequestInput
  implements IValidMeasurementUnitConversionCreationRequestInput
{
  onlyForIngredient?: string;
  from: NonNullable<string> = '';
  to: NonNullable<string> = '';
  notes: NonNullable<string> = '';
  modifier: NonNullable<number> = 0;

  constructor(
    input: {
      onlyForIngredient?: string;
      from?: string;
      to?: string;
      notes?: string;
      modifier?: number;
    } = {},
  ) {
    this.onlyForIngredient = input.onlyForIngredient;
    this.from = input.from ?? '';
    this.to = input.to ?? '';
    this.notes = input.notes ?? '';
    this.modifier = input.modifier ?? 0;
  }
}

export interface IValidMeasurementUnitConversionUpdateRequestInput {
  from?: string;
  to?: string;
  onlyForIngredient?: string;
  modifier?: number;
  notes?: string;
}

export class ValidMeasurementUnitConversionUpdateRequestInput
  implements IValidMeasurementUnitConversionUpdateRequestInput
{
  from?: string;
  to?: string;
  onlyForIngredient?: string;
  modifier?: number;
  notes?: string;

  constructor(
    input: {
      from?: string;
      to?: string;
      onlyForIngredient?: string;
      modifier?: number;
      notes?: string;
    } = {},
  ) {
    this.from = input.from;
    this.to = input.to;
    this.onlyForIngredient = input.onlyForIngredient;
    this.modifier = input.modifier;
    this.notes = input.notes;
  }
}
