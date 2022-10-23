import { QueryFilteredResult } from "./pagination";
import { Recipe } from "./recipes";

export class Meal {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  description: string;
  createdByUser: string;
  name: string;
  recipes: Recipe[];
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      description?: string;
      createdByUser?: string;
      name?: string;
      recipes?: Recipe[];
      createdAt?: string;
    } = {}
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || "";
    this.description = input.description || "";
    this.createdByUser = input.createdByUser || "";
    this.name = input.name || "";
    this.recipes = (input.recipes || []).map((x: Recipe) => new Recipe(x));
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
  }
}

export class MealList extends QueryFilteredResult<Meal> {
  constructor(
    input: {
      data?: Meal[];
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

export class MealCreationRequestInput {
  name: string;
  description: string;
  recipes: string[];

  constructor(
    input: {
      name?: string;
      description?: string;
      recipes?: string[];
    } = {}
  ) {
    this.name = input.name || "";
    this.description = input.description || "";
    this.recipes = input.recipes || [];
  }

  static fromMeal(input: Meal): MealCreationRequestInput {
    const x = new MealCreationRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.recipes = input.recipes.map((r) => r.id);

    return x;
  }
}

export class MealUpdateRequestInput {
  name?: string;
  description?: string;
  recipes?: string[];

  constructor(
    input: {
      name?: string;
      description?: string;
      recipes?: string[];
    } = {}
  ) {
    this.name = input.name;
    this.description = input.description;
    this.recipes = input.recipes;
  }

  static fromMeal(input: Meal): MealUpdateRequestInput {
    const x = new MealUpdateRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.recipes = input.recipes.map((r) => r.id);

    return x;
  }
}
