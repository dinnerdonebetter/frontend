export class RecipePrepTaskStep {
  id: string;
  belongsToRecipeStep: string;
  belongsToRecipeStepTask: string;
  satisfiesRecipeStep: boolean;

  constructor(
    input: {
      id?: string;
      belongsToRecipeStep?: string;
      belongsToRecipeStepTask?: string;
      satisfiesRecipeStep?: boolean;
    } = {}
  ) {
    this.id = input.id;
    this.belongsToRecipeStep = input.belongsToRecipeStep;
    this.belongsToRecipeStepTask = input.belongsToRecipeStepTask;
    this.satisfiesRecipeStep = input.satisfiesRecipeStep;
  }
}

export class RecipePrepTaskStepCreationRequestInput {
  belongsToRecipeStep: string;
  satisfiesRecipeStep: boolean;

  constructor(
    input: {
      belongsToRecipeStep?: string;
      satisfiesRecipeStep?: boolean;
    } = {}
  ) {
    this.belongsToRecipeStep = input.belongsToRecipeStep;
    this.satisfiesRecipeStep = input.satisfiesRecipeStep;
  }
}

export class RecipePrepTaskStepUpdateRequestInput {
  satisfiesRecipeStep?: boolean;
  belongsToRecipeStep?: string;
  belongsToRecipeStepTask?: string;

  constructor(
    input: {
      satisfiesRecipeStep?: boolean;
      belongsToRecipeStep?: string;
      belongsToRecipeStepTask?: string;
    } = {}
  ) {
    this.satisfiesRecipeStep = input.satisfiesRecipeStep;
    this.belongsToRecipeStep = input.belongsToRecipeStep;
    this.belongsToRecipeStepTask = input.belongsToRecipeStepTask;
  }
}
