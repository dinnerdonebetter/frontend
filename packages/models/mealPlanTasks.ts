import { MealPlanOption } from "./mealPlanOptions";
import { QueryFilteredResult } from "./pagination";
import { RecipeStep } from "./recipeSteps";

export type validStatus =
  | "unfinished"
  | "postponed"
  | "ignored"
  | "canceled"
  | "finished";

export class MealPlanTask {
  id: string;
  status: validStatus;
  assignedToUser?: string;
  creationExplanation: string;
  statusExplanation: string;
  mealPlanOption: MealPlanOption;
  recipeSteps: RecipeStep[];
  createdAt: string;
  completedAt?: string;

  constructor(
    input: {
      id?: string;
      status?: validStatus;
      assignedToUser?: string;
      creationExplanation?: string;
      statusExplanation?: string;
      mealPlanOption?: MealPlanOption;
      recipeSteps?: RecipeStep[];
      createdAt?: string;
      completedAt?: string;
    } = {}
  ) {
    this.id = input.id || "";
    this.creationExplanation = input.creationExplanation || "";
    this.status = input.status || "unfinished";
    this.assignedToUser = input.assignedToUser;
    this.statusExplanation = input.statusExplanation || "";
    this.mealPlanOption = input.mealPlanOption || new MealPlanOption();
    this.recipeSteps = input.recipeSteps || [];
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.completedAt = input.completedAt || "1970-01-01T00:00:00Z";
  }
}

export class MealPlanTaskList extends QueryFilteredResult<MealPlanTask> {
  constructor(
    input: {
      data?: MealPlanTask[];
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

export class MealPlanTaskStatusChangeRequestInput {
  status: validStatus;
  statusExplanation: string;

  constructor(
    input: {
      status?: validStatus;
      statusExplanation?: string;
    } = {}
  ) {
    this.status = input.status || "unfinished";
    this.statusExplanation = input.statusExplanation || "";
  }
}
