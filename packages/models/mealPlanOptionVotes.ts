import { MealPlanOption } from "./mealPlanOptions";

import { QueryFilteredResult } from "./pagination";

export class MealPlanOptionVote {
  lastUpdatedAt?: string;
  archivedAt?: string;
  id: string;
  notes: string;
  belongsToMealPlanOption: string;
  byUser: string;
  createdAt: string;
  rank: number;
  abstain: boolean;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      id?: string;
      notes?: string;
      belongsToMealPlanOption?: string;
      byUser?: string;
      createdAt?: string;
      rank?: number;
      abstain?: boolean;
    } = {}
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.id = input.id || "";
    this.notes = input.notes || "";
    this.belongsToMealPlanOption = input.belongsToMealPlanOption || "";
    this.byUser = input.byUser || "";
    this.createdAt = input.createdAt || "1970-01-01T00:00:00Z";
    this.rank = input.rank || -1;
    this.abstain = Boolean(input.abstain);
  }
}

export class MealPlanOptionVoteList extends QueryFilteredResult<MealPlanOptionVote> {
  constructor(
    input: {
      data?: MealPlanOptionVote[];
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

export class MealPlanOptionVoteCreationInput {
  notes: string;
  belongsToMealPlanOption: string;
  rank: number;
  abstain: boolean;

  constructor(
    input: {
      notes?: string;
      belongsToMealPlanOption?: string;
      rank?: number;
      abstain?: boolean;
    } = {}
  ) {
    this.notes = input.notes || "";
    this.belongsToMealPlanOption = input.belongsToMealPlanOption || "";
    this.rank = input.rank || -1;
    this.abstain = Boolean(input.abstain);
  }

  static fromMealPlanOption(
    input: MealPlanOption
  ): MealPlanOptionVoteCreationInput {
    return new MealPlanOptionVoteCreationInput({
      notes: input.notes,
      belongsToMealPlanOption: input.id,
      abstain: false,
    });
  }

  static fromMealPlanOptionVote(
    input: MealPlanOptionVote
  ): MealPlanOptionVoteCreationInput {
    return new MealPlanOptionVoteCreationInput({
      notes: input.notes,
      belongsToMealPlanOption: input.belongsToMealPlanOption,
      rank: input.rank,
      abstain: input.abstain,
    });
  }
}

export class MealPlanOptionVoteCreationRequestInput {
  votes: MealPlanOptionVoteCreationInput[];

  constructor(
    input: {
      votes?: MealPlanOptionVoteCreationInput[];
    } = {}
  ) {
    this.votes = input.votes || [];
  }
}

export class MealPlanOptionVoteUpdateRequestInput {
  notes?: string;
  belongsToMealPlanOption?: string;
  rank?: number;
  abstain?: boolean;

  constructor(
    input: {
      notes?: string;
      belongsToMealPlanOption?: string;
      rank?: number;
      abstain?: boolean;
    } = {}
  ) {
    this.notes = input.notes;
    this.belongsToMealPlanOption = input.belongsToMealPlanOption;
    this.rank = input.rank;
    this.abstain = input.abstain;
  }

  static fromMealPlanOptionVote(
    input: MealPlanOptionVote
  ): MealPlanOptionVoteUpdateRequestInput {
    const x = new MealPlanOptionVoteUpdateRequestInput();

    x.notes = input.notes;
    x.belongsToMealPlanOption = input.belongsToMealPlanOption;
    x.rank = input.rank;
    x.abstain = input.abstain;

    return x;
  }
}
