import { QueryFilteredResult } from './pagination';
import { Recipe } from './recipes';

export type MealComponentType =
  | 'unspecified'
  | 'amuse-bouche'
  | 'appetizer'
  | 'soup'
  | 'main'
  | 'salad'
  | 'beverage'
  | 'side'
  | 'dessert';

export class MealRecipe {
  recipe: Recipe;
  componentType: MealComponentType;

  constructor(input: { recipe: Recipe; componentType: MealComponentType }) {
    this.recipe = input.recipe;
    this.componentType = input.componentType;
  }
}

export class Meal {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  description: string;
  createdByUser: string;
  name: string;
  components: MealRecipe[];
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      description?: string;
      createdByUser?: string;
      name?: string;
      components?: MealRecipe[];
      createdAt?: string;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || '';
    this.description = input.description || '';
    this.createdByUser = input.createdByUser || '';
    this.name = input.name || '';
    this.components = (input.components || []).map((x: MealRecipe) => new MealRecipe(x));
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
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

export class MealRecipeCreationRequestInput {
  recipe: string;
  componentType: MealComponentType;

  constructor(input: { recipe: string; componentType: MealComponentType }) {
    this.recipe = input.recipe;
    this.componentType = input.componentType;
  }
}

export class MealCreationRequestInput {
  name: string;
  description: string;
  components: MealRecipeCreationRequestInput[];

  constructor(
    input: {
      name?: string;
      description?: string;
      components?: MealRecipeCreationRequestInput[];
    } = {},
  ) {
    this.name = input.name || '';
    this.description = input.description || '';
    this.components = input.components || [];
  }

  static fromMeal(input: Meal): MealCreationRequestInput {
    const x = new MealCreationRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.components = input.components.map(
      (r) =>
        new MealRecipeCreationRequestInput({
          recipe: r.recipe.id,
          componentType: r.componentType,
        }),
    );

    return x;
  }
}

export class MealRecipeUpdateRequestInput {
  recipe: string;
  componentType: MealComponentType;

  constructor(input: { recipe: string; componentType: MealComponentType }) {
    this.recipe = input.recipe;
    this.componentType = input.componentType;
  }
}

export class MealUpdateRequestInput {
  name?: string;
  description?: string;
  components?: MealRecipeUpdateRequestInput[];

  constructor(
    input: {
      name?: string;
      description?: string;
      components?: MealRecipeUpdateRequestInput[];
    } = {},
  ) {
    this.name = input.name;
    this.description = input.description;
    this.components = input.components;
  }

  static fromMeal(input: Meal): MealUpdateRequestInput {
    const x = new MealUpdateRequestInput();

    x.name = input.name;
    x.description = input.description;
    x.components = input.components.map(
      (r) => new MealRecipeUpdateRequestInput({ recipe: r.recipe.id, componentType: r.componentType }),
    );

    return x;
  }
}
