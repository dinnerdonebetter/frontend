import { QueryFilteredResult } from './pagination';
import { RecipeMedia } from './recipeMedia';
import { RecipePrepTask, RecipePrepTaskCreationRequestInput } from './recipePrepTasks';
import { RecipeStepProduct, RecipeStepProductCreationRequestInput } from './recipeStepProducts';
import { RecipeStep, RecipeStepCreationRequestInput } from './recipeSteps';

export class Recipe {
  lastUpdatedAt?: string;
  archivedAt?: string;
  inspiredByRecipeID?: string;
  source: string;
  description: string;
  id: string;
  name: string;
  belongsToUser: string;
  steps: RecipeStep[];
  prepTasks: RecipePrepTask[];
  media: RecipeMedia[];
  createdAt: string;
  yieldsPortions: number;
  sealOfApproval: boolean;

  constructor(
    input: {
      lastUpdatedAt?: string;
      archivedAt?: string;
      inspiredByRecipeID?: string;
      source?: string;
      description?: string;
      id?: string;
      name?: string;
      belongsToUser?: string;
      steps?: RecipeStep[];
      prepTasks?: RecipePrepTask[];
      media?: RecipeMedia[];
      createdAt?: string;
      yieldsPortions?: number;
      sealOfApproval?: boolean;
    } = {},
  ) {
    this.lastUpdatedAt = input.lastUpdatedAt;
    this.archivedAt = input.archivedAt;
    this.inspiredByRecipeID = input.inspiredByRecipeID;
    this.source = input.source || '';
    this.description = input.description || '';
    this.id = input.id || '';
    this.name = input.name || '';
    this.belongsToUser = input.belongsToUser || '';
    this.steps = (input.steps || []).map((x: RecipeStep) => new RecipeStep(x));
    this.prepTasks = (input.prepTasks || []).map((x: RecipePrepTask) => new RecipePrepTask(x));
    this.media = (input.media || []).map((x: RecipeMedia) => new RecipeMedia(x));
    this.createdAt = input.createdAt || '1970-01-01T00:00:00Z';
    this.yieldsPortions = input.yieldsPortions || 0;
    this.sealOfApproval = Boolean(input.sealOfApproval);
  }

  public static toCreationRequestInput(x: Recipe): RecipeCreationRequestInput {
    const input = new RecipeCreationRequestInput({
      inspiredByRecipeID: x.inspiredByRecipeID,
      name: x.name,
      source: x.source,
      description: x.description,
      yieldsPortions: x.yieldsPortions,
      sealOfApproval: x.sealOfApproval,
      prepTasks: x.prepTasks.map((y: RecipePrepTask) => {
        return new RecipePrepTaskCreationRequestInput({
          notes: y.notes,
          explicitStorageInstructions: y.explicitStorageInstructions,
          storageType: y.storageType,
          belongsToRecipe: y.belongsToRecipe,
          recipeSteps: y.recipeSteps,
          minimumTimeBufferBeforeRecipeInSeconds: y.minimumTimeBufferBeforeRecipeInSeconds,
          maximumStorageTemperatureInCelsius: y.maximumStorageTemperatureInCelsius,
          maximumTimeBufferBeforeRecipeInSeconds: y.maximumTimeBufferBeforeRecipeInSeconds,
          minimumStorageTemperatureInCelsius: y.minimumStorageTemperatureInCelsius,
        });
      }),
      steps: x.steps.map((y: RecipeStep) => {
        return new RecipeStepCreationRequestInput({
          minimumTemperatureInCelsius: y.minimumTemperatureInCelsius,
          maximumTemperatureInCelsius: y.maximumTemperatureInCelsius,
          notes: y.notes,
          preparationID: y.preparation.id,
          instruments: y.instruments,
          ingredients: y.ingredients,
          index: y.index,
          minimumEstimatedTimeInSeconds: y.minimumEstimatedTimeInSeconds,
          maximumEstimatedTimeInSeconds: y.maximumEstimatedTimeInSeconds,
          optional: y.optional,
          explicitInstructions: y.explicitInstructions,
          products: y.products.map((z: RecipeStepProduct) => {
            return new RecipeStepProductCreationRequestInput({
              name: z.name,
              type: z.type,
              measurementUnitID: z.measurementUnit.id,
              quantityNotes: z.quantityNotes,
              minimumQuantity: z.minimumQuantity,
              maximumQuantity: z.maximumQuantity,
              compostable: z.compostable,
              maximumStorageDurationInSeconds: z.maximumStorageDurationInSeconds,
              minimumStorageTemperatureInCelsius: z.minimumStorageTemperatureInCelsius,
              maximumStorageTemperatureInCelsius: z.maximumStorageTemperatureInCelsius,
              isWaste: z.isWaste,
              isLiquid: z.isLiquid,
            });
          }),
        });
      }),
    });

    return input;
  }
}

export class RecipeList extends QueryFilteredResult<Recipe> {
  constructor(
    input: {
      data?: Recipe[];
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

export class RecipeCreationRequestInput {
  inspiredByRecipeID?: string;
  name: string;
  source: string;
  description: string;
  steps: RecipeStepCreationRequestInput[];
  prepTasks: RecipePrepTaskCreationRequestInput[];
  alsoCreateMeal: boolean;
  yieldsPortions: number;
  sealOfApproval: boolean;

  constructor(
    input: {
      inspiredByRecipeID?: string;
      name?: string;
      source?: string;
      description?: string;
      steps?: RecipeStepCreationRequestInput[];
      prepTasks?: RecipePrepTaskCreationRequestInput[];
      alsoCreateMeal?: boolean;
      yieldsPortions?: number;
      sealOfApproval?: boolean;
    } = {},
  ) {
    this.inspiredByRecipeID = input.inspiredByRecipeID;
    this.name = input.name || '';
    this.source = input.source || '';
    this.description = input.description || '';
    this.steps = (input.steps || []).map((x: RecipeStepCreationRequestInput) => new RecipeStepCreationRequestInput(x));
    this.prepTasks = (input.prepTasks || []).map(
      (x: RecipePrepTaskCreationRequestInput) => new RecipePrepTaskCreationRequestInput(x),
    );
    this.alsoCreateMeal = Boolean(input.alsoCreateMeal);
    this.yieldsPortions = input.yieldsPortions || 0;
    this.sealOfApproval = Boolean(input.sealOfApproval);
  }

  static fromRecipe(r: Recipe): RecipeCreationRequestInput {
    const ri = new RecipeCreationRequestInput();

    ri.name = r.name;
    ri.source = r.source;
    ri.description = r.description;
    ri.inspiredByRecipeID = r.inspiredByRecipeID;
    ri.steps = r.steps ? r.steps.map(RecipeStepCreationRequestInput.fromRecipeStep) : [];
    ri.yieldsPortions = r.yieldsPortions;
    ri.sealOfApproval = Boolean(r.sealOfApproval);

    return ri;
  }
}

export class RecipeUpdateRequestInput {
  name?: string;
  source?: string;
  description?: string;
  inspiredByRecipeID?: string;
  yieldsPortions?: number;
  sealOfApproval?: boolean;

  constructor(
    input: {
      name?: string;
      source?: string;
      description?: string;
      inspiredByRecipeID?: string;
      yieldsPortions?: number;
      sealOfApproval?: boolean;
    } = {},
  ) {
    this.name = input.name;
    this.source = input.source;
    this.description = input.description;
    this.inspiredByRecipeID = input.inspiredByRecipeID;
    this.yieldsPortions = input.yieldsPortions;
    this.sealOfApproval = input.sealOfApproval;
  }

  static fromRecipe(r: Recipe): RecipeUpdateRequestInput {
    const ri = new RecipeUpdateRequestInput();

    ri.name = r.name;
    ri.source = r.source;
    ri.description = r.description;
    ri.inspiredByRecipeID = r.inspiredByRecipeID;
    ri.yieldsPortions = r.yieldsPortions;
    ri.sealOfApproval = r.sealOfApproval;

    return ri;
  }
}
