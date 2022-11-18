import { QueryFilteredResult } from './pagination';
import { Recipe } from './recipes';

export const ALL_MEAL_COMPONENT_TYPES = [
  'main',
  'side',
  'appetizer',
  'beverage',
  'dessert',
  'soup',
  'salad',
  'amuse-bouche',
  'unspecified',
];

type MealComponentTypeTuple = typeof ALL_MEAL_COMPONENT_TYPES;
export type MealComponentType = MealComponentTypeTuple[number];

export class MealComponent {
  recipe: Recipe;
  componentType: MealComponentType;

  constructor(input: { recipe: Recipe; componentType?: MealComponentType }) {
    this.recipe = input.recipe;
    this.componentType = input.componentType || 'unspecified';
  }
}

export class Meal {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  description: string;
  createdByUser: string;
  name: string;
  components: MealComponent[];
  createdAt: string;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      description?: string;
      createdByUser?: string;
      name?: string;
      components?: MealComponent[];
      createdAt?: string;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || '';
    this.description = input.description || '';
    this.createdByUser = input.createdByUser || '';
    this.name = input.name || '';
    this.components = (input.components || []).map((x: MealComponent) => new MealComponent(x));
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
  }

  public static toCreationRequestInput(x: Meal): MealCreationRequestInput {
    const y = new MealCreationRequestInput({
      name: x.name,
      description: x.description,
      components: x.components.map((x: MealComponent) => ({
        recipeID: x.recipe.id,
        componentType: x.componentType,
      })),
    });

    return y;
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

export class MealComponentCreationRequestInput {
  recipeID: string;
  componentType: MealComponentType;

  constructor(input: { recipeID: string; componentType: MealComponentType }) {
    this.recipeID = input.recipeID;
    this.componentType = input.componentType;
  }
}

export class MealCreationRequestInput {
  name: string;
  description: string;
  components: MealComponentCreationRequestInput[];

  constructor(
    input: {
      name?: string;
      description?: string;
      components?: MealComponentCreationRequestInput[];
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
        new MealComponentCreationRequestInput({
          recipeID: r.recipe.id,
          componentType: r.componentType,
        }),
    );

    return x;
  }
}

export class MealComponentUpdateRequestInput {
  recipeID: string;
  componentType: MealComponentType;

  constructor(input: { recipeID: string; componentType: MealComponentType }) {
    this.recipeID = input.recipeID;
    this.componentType = input.componentType;
  }
}

export class MealUpdateRequestInput {
  name?: string;
  description?: string;
  components?: MealComponentUpdateRequestInput[];

  constructor(
    input: {
      name?: string;
      description?: string;
      components?: MealComponentUpdateRequestInput[];
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
      (r) => new MealComponentUpdateRequestInput({ recipeID: r.recipe.id, componentType: r.componentType }),
    );

    return x;
  }
}
