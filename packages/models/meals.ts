// Code generated by gen_typescript. DO NOT EDIT.

import { MealComponent, MealComponentCreationRequestInput, MealComponentUpdateRequestInput } from './mealComponents';

export interface IMeal {
  createdAt: NonNullable<string>;
  archivedAt?: string;
  lastUpdatedAt?: string;
  maximumEstimatedPortions?: number;
  id: NonNullable<string>;
  description: NonNullable<string>;
  createdByUser: NonNullable<string>;
  name: NonNullable<string>;
  components: NonNullable<Array<MealComponent>>;
  minimumEstimatedPortions: NonNullable<number>;
}

export class Meal implements IMeal {
  createdAt: NonNullable<string> = '1970-01-01T00:00:00Z';
  archivedAt?: string;
  lastUpdatedAt?: string;
  maximumEstimatedPortions?: number;
  id: NonNullable<string> = '';
  description: NonNullable<string> = '';
  createdByUser: NonNullable<string> = '';
  name: NonNullable<string> = '';
  components: NonNullable<Array<MealComponent>> = [];
  minimumEstimatedPortions: NonNullable<number> = 0;

  constructor(input: Partial<Meal> = {}) {
    this.createdAt = input.createdAt ?? '1970-01-01T00:00:00Z';
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.maximumEstimatedPortions = input.maximumEstimatedPortions;
    this.id = input.id ?? '';
    this.description = input.description ?? '';
    this.createdByUser = input.createdByUser ?? '';
    this.name = input.name ?? '';
    this.components = input.components ?? [];
    this.minimumEstimatedPortions = input.minimumEstimatedPortions ?? 0;
  }
}

export interface IMealCreationRequestInput {
  maximumEstimatedPortions?: number;
  name: NonNullable<string>;
  description: NonNullable<string>;
  recipes: NonNullable<Array<MealComponentCreationRequestInput>>;
  minimumEstimatedPortions: NonNullable<number>;
}

export class MealCreationRequestInput implements IMealCreationRequestInput {
  maximumEstimatedPortions?: number;
  name: NonNullable<string> = '';
  description: NonNullable<string> = '';
  recipes: NonNullable<Array<MealComponentCreationRequestInput>> = [];
  minimumEstimatedPortions: NonNullable<number> = 0;

  constructor(input: Partial<MealCreationRequestInput> = {}) {
    this.maximumEstimatedPortions = input.maximumEstimatedPortions;
    this.name = input.name ?? '';
    this.description = input.description ?? '';
    this.recipes = input.recipes ?? [];
    this.minimumEstimatedPortions = input.minimumEstimatedPortions ?? 0;
  }
}

export interface IMealUpdateRequestInput {
  name?: string;
  description?: string;
  minimumEstimatedPortions?: number;
  maximumEstimatedPortions?: number;
  recipes: NonNullable<Array<MealComponentUpdateRequestInput>>;
}

export class MealUpdateRequestInput implements IMealUpdateRequestInput {
  name?: string;
  description?: string;
  minimumEstimatedPortions?: number;
  maximumEstimatedPortions?: number;
  recipes: NonNullable<Array<MealComponentUpdateRequestInput>> = [];

  constructor(input: Partial<MealUpdateRequestInput> = {}) {
    this.name = input.name;
    this.description = input.description;
    this.minimumEstimatedPortions = input.minimumEstimatedPortions;
    this.maximumEstimatedPortions = input.maximumEstimatedPortions;
    this.recipes = input.recipes ?? [];
  }
}
