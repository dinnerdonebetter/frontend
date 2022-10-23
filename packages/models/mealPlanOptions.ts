import { QueryFilteredResult } from "./pagination";
import { Meal } from "./meals";
import { MealPlanOptionVote } from "./mealPlanOptionVotes";

export class MealPlanOption {
  archivedAt?: string;
  lastUpdatedAt?: string;
  id: string;
  belongsToMealPlanEvent: string;
  notes: string;
  votes: MealPlanOptionVote[];
  meal: Meal;
  createdAt: string;
  chosen: boolean;
  tieBroken: boolean;
  assignedCook: string;
  assignedDishwasher: string;
  prepStepsCreated: boolean;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      id?: string;
      belongsToMealPlanEvent?: string;
      notes?: string;
      votes?: MealPlanOptionVote[];
      meal?: Meal;
      createdAt?: string;
      chosen?: boolean;
      tieBroken?: boolean;
      assignedCook?: string;
      assignedDishwasher?: string;
      prepStepsCreated?: boolean;
    } = {}
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.id = input.id || "";
    this.belongsToMealPlanEvent = input.belongsToMealPlanEvent || "";
    this.notes = input.notes || "";
    this.votes = input.votes || [];
    this.meal = input.meal || new Meal();
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.chosen = Boolean(input.chosen);
    this.tieBroken = Boolean(input.tieBroken);
    this.assignedCook = input.assignedCook || "";
    this.assignedDishwasher = input.assignedDishwasher || "";
    this.prepStepsCreated = Boolean(input.prepStepsCreated);
  }
}

export class MealPlanOptionList extends QueryFilteredResult<MealPlanOption> {
  constructor(
    input: {
      data?: MealPlanOption[];
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

export class MealPlanOptionCreationRequestInput {
  mealID: string;
  notes: string;
  assignedCook: string;
  assignedDishwasher: string;
  prepStepsCreated: boolean;

  constructor(
    input: {
      mealID?: string;
      notes?: string;
      assignedCook?: string;
      assignedDishwasher?: string;
      prepStepsCreated?: boolean;
    } = {}
  ) {
    this.mealID = input.mealID || "";
    this.notes = input.notes || "";
    this.assignedCook = input.assignedCook || "";
    this.assignedDishwasher = input.assignedDishwasher || "";
    this.prepStepsCreated = Boolean(input.prepStepsCreated);
  }

  static fromMeal(meal: Meal): MealPlanOptionCreationRequestInput {
    const x = new MealPlanOptionCreationRequestInput();

    x.mealID = meal.id;

    return x;
  }

  static fromMealPlanOption(
    mealPlanOption: MealPlanOption
  ): MealPlanOptionCreationRequestInput {
    const x = new MealPlanOptionCreationRequestInput();

    x.mealID = mealPlanOption.meal.id;
    x.notes = mealPlanOption.notes;
    x.assignedCook = mealPlanOption.assignedCook;
    x.assignedDishwasher = mealPlanOption.assignedDishwasher;
    x.prepStepsCreated = mealPlanOption.prepStepsCreated;

    return x;
  }
}

export class MealPlanOptionUpdateRequestInput {
  mealID?: string;
  notes?: string;
  assignedCook?: string;
  assignedDishwasher?: string;
  prepStepsCreated: boolean;

  constructor(
    input: {
      mealID?: string;
      notes?: string;
      assignedCook?: string;
      assignedDishwasher?: string;
      prepStepsCreated?: boolean;
    } = {}
  ) {
    this.mealID = input.mealID;
    this.notes = input.notes;
    this.assignedCook = input.assignedCook;
    this.assignedDishwasher = input.assignedDishwasher;
    this.prepStepsCreated = Boolean(input.prepStepsCreated);
  }

  static fromMealPlanOption(
    mealPlanOption: MealPlanOption
  ): MealPlanOptionUpdateRequestInput {
    const x = new MealPlanOptionUpdateRequestInput();

    x.mealID = mealPlanOption.meal.id;
    x.notes = mealPlanOption.notes;
    x.assignedCook = mealPlanOption.assignedCook;
    x.assignedDishwasher = mealPlanOption.assignedDishwasher;
    x.prepStepsCreated = mealPlanOption.prepStepsCreated;

    return x;
  }
}
