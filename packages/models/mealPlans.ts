import { QueryFilteredResult } from './pagination';
import { MealPlanEvent, MealPlanEventCreationRequestInput } from './mealPlanEvents';

type validMealPlanStatus = 'awaiting_votes' | 'finalized';
type validMealPlanElectionMethod = 'schulze' | 'instant-runoff';

export class MealPlan {
  archivedAt?: string;
  lastUpdatedAt?: string;
  status: validMealPlanStatus;
  id: string;
  belongsToHousehold: string;
  notes: string;
  events: MealPlanEvent[];
  votingDeadline: string;
  createdAt: string;
  electionMethod: validMealPlanElectionMethod;
  groceryListInitialized: boolean;
  tasksCreated: boolean;

  constructor(
    input: {
      archivedAt?: string;
      lastUpdatedAt?: string;
      status?: validMealPlanStatus;
      id?: string;
      belongsToHousehold?: string;
      notes?: string;
      events?: MealPlanEvent[];
      votingDeadline?: string;
      createdAt?: string;
      electionMethod?: validMealPlanElectionMethod;
      groceryListInitialized?: boolean;
      tasksCreated?: boolean;
    } = {},
  ) {
    this.archivedAt = input.archivedAt;
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.status = input.status || 'awaiting_votes';
    this.id = input.id || '';
    this.belongsToHousehold = input.belongsToHousehold || '';
    this.notes = input.notes || '';
    this.events = (input.events || []).map((x: MealPlanEvent) => new MealPlanEvent(x));
    this.votingDeadline = input.votingDeadline || '1970-01-01T00:00:00Z';
    this.electionMethod = input.electionMethod || 'schulze';
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.groceryListInitialized = Boolean(input.groceryListInitialized);
    this.tasksCreated = Boolean(input.tasksCreated);
  }
}

export class MealPlanList extends QueryFilteredResult<MealPlan> {
  constructor(
    input: {
      data?: MealPlan[];
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

export class MealPlanCreationRequestInput {
  notes: string;
  events: MealPlanEventCreationRequestInput[];
  votingDeadline: string;

  constructor(
    input: {
      notes?: string;
      events?: MealPlanEventCreationRequestInput[];
      votingDeadline?: string;
    } = {},
  ) {
    this.notes = input.notes || '';
    this.events = (input.events || []).map(
      (x: MealPlanEventCreationRequestInput) => new MealPlanEventCreationRequestInput(x),
    );
    this.votingDeadline = input.votingDeadline || '1970-01-01T00:00:00Z';
  }
}

export class MealPlanUpdateRequestInput {
  notes?: string;
  votingDeadline?: string;

  constructor(
    input: {
      notes?: string;
      votingDeadline?: string;
    } = {},
  ) {
    this.notes = input.notes;
    this.votingDeadline = input.votingDeadline;
  }
}
