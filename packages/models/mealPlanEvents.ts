import { QueryFilteredResult } from "./pagination";
import {
  MealPlanOption,
  MealPlanOptionCreationRequestInput,
} from "./mealPlanOptions";

type validMealName =
  | "breakfast"
  | "second_breakfast"
  | "brunch"
  | "lunch"
  | "supper"
  | "dinner";

export class MealPlanEvent {
  id: string;
  belongsToMealPlan: string;
  notes: string;
  mealName: validMealName;
  options: MealPlanOption[];
  startsAt: string;
  endsAt: string;
  createdAt: string;
  archivedAt?: string;
  lastUpdatedAt?: string;

  constructor(
    input: {
      id?: string;
      belongsToMealPlan?: string;
      notes?: string;
      mealName?: validMealName;
      options?: MealPlanOption[];
      startsAt?: string;
      endsAt?: string;
      createdAt?: string;
      archivedAt?: string;
      lastUpdatedAt?: string;
    } = {}
  ) {
    this.id = input.id || "";
    this.belongsToMealPlan = input.belongsToMealPlan || "";
    this.notes = input.notes || "";
    this.mealName = input.mealName || "second_breakfast";
    this.options = input.options || [];
    this.startsAt = input.startsAt || "";
    this.endsAt = input.endsAt || "";
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
  }
}

export class MealPlanEventList extends QueryFilteredResult<MealPlanEvent> {
  constructor(
    input: {
      data?: MealPlanEvent[];
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

export class MealPlanEventCreationRequestInput {
  notes: string;
  mealName: validMealName;
  startsAt: string;
  endsAt: string;
  options: MealPlanOptionCreationRequestInput[];

  constructor(
    input: {
      notes?: string;
      mealName?: validMealName;
      startsAt?: string;
      endsAt?: string;
      options?: MealPlanOptionCreationRequestInput[];
    } = {}
  ) {
    this.notes = input.notes || "";
    this.mealName = input.mealName || "second_breakfast";
    this.startsAt = input.startsAt || "1970-01-01T00:00:00Z";
    this.endsAt = input.endsAt || "1970-01-01T00:00:00Z";
    this.options = input.options || [];
  }

  static fromMealPlanEvent(
    mealPlanEvent: MealPlanEvent
  ): MealPlanEventCreationRequestInput {
    const x = new MealPlanEventCreationRequestInput();

    x.notes = mealPlanEvent.notes;
    x.mealName = mealPlanEvent.mealName;

    return x;
  }
}

export class MealPlanEventUpdateRequestInput {
  notes?: string;
  mealName?: validMealName;
  startsAt?: string;
  endsAt?: string;

  constructor(
    input: {
      notes?: string;
      mealName?: validMealName;
      startsAt?: string;
      endsAt?: string;
    } = {}
  ) {
    this.notes = input.notes;
    this.mealName = input.mealName;
    this.startsAt = input.startsAt || "1970-01-01T00:00:00Z";
    this.endsAt = input.endsAt || "1970-01-01T00:00:00Z";
  }
}
