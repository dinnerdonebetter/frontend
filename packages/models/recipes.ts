import dagre from 'dagre';
import { QueryFilteredResult } from './pagination';
import { RecipeMedia } from './recipeMedia';
import { RecipePrepTask, RecipePrepTaskCreationRequestInput } from './recipePrepTasks';
import { RecipeStepIngredient, RecipeStepIngredientCreationRequestInput } from './recipeStepIngredients';
import { RecipeStepInstrument, RecipeStepInstrumentCreationRequestInput } from './recipeStepInstruments';
import { RecipeStepProduct, RecipeStepProductCreationRequestInput } from './recipeStepProducts';
import { RecipeStep, RecipeStepCreationRequestInput } from './recipeSteps';
import { ValidMeasurementUnit } from './validMeasurementUnits';

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
          index: y.index,
          minimumEstimatedTimeInSeconds: y.minimumEstimatedTimeInSeconds,
          maximumEstimatedTimeInSeconds: y.maximumEstimatedTimeInSeconds,
          optional: y.optional,
          explicitInstructions: y.explicitInstructions,
          instruments: y.instruments.map((z: RecipeStepInstrument) => new RecipeStepInstrumentCreationRequestInput(z)),
          ingredients: y.ingredients.map((z: RecipeStepIngredient) => new RecipeStepIngredientCreationRequestInput(z)),
          products: y.products.map((z: RecipeStepProduct) => new RecipeStepProductCreationRequestInput(z)),
          // completionConditions: y.completionConditions.map(
          //   (z: RecipeStepCompletionCondition) =>
          //     new RecipeStepCompletionConditionCreationRequestInput({
          //       ...z,
          //       ingredients: z.ingredients.map(
          //         (a: RecipeStepCompletionConditionIngredient) =>
          //           new RecipeStepCompletionConditionIngredientCreationRequestInput(a),
          //       ),
          //     }),
          // ),
        });
      }),
    });

    return input;
  }

  public static toDAG(recipe: Recipe): dagre.graphlib.Graph<string> {
    const nodeWidth = 200;
    const nodeHeight = 50;

    const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient): boolean => {
      return Boolean(x.recipeStepProductID) && x.recipeStepProductID !== '';
    };

    const buildNodeIDForRecipeStepProduct = (recipe: Recipe, recipeStepProductID: string): string => {
      let found = 'UNKNOWN';
      (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
        (step.products || []).forEach((product: RecipeStepProduct) => {
          if (product.id === recipeStepProductID) {
            found = (stepIndex + 1).toString();
          }
        });
      });

      return found;
    };

    const dagreGraph: dagre.graphlib.Graph<string> = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: 'LR' });

    let addedNodeCount = 0;

    recipe.steps.forEach((step: RecipeStep) => {
      const stepIndex = (step.index + 1).toString();
      dagreGraph.setNode(stepIndex, { width: nodeWidth, height: nodeHeight });
      addedNodeCount += 1;
    });

    recipe.steps.forEach((step: RecipeStep) => {
      const stepIndex = (step.index + 1).toString();
      step.ingredients.forEach((ingredient: RecipeStepIngredient) => {
        if (stepElementIsProduct(ingredient)) {
          dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, ingredient.recipeStepProductID!), stepIndex);
        }
      });

      step.instruments.forEach((instrument: RecipeStepInstrument) => {
        if (stepElementIsProduct(instrument)) {
          dagreGraph.setEdge(buildNodeIDForRecipeStepProduct(recipe, instrument.recipeStepProductID!), stepIndex);
        }
      });
    });

    dagre.layout(dagreGraph);

    return dagreGraph;
  }

  public static determineAvailableRecipeStepProducts = (
    recipe: Recipe,
    upToStep: number,
  ): Array<RecipeStepIngredient> => {
    // first we need to determine the available products thusfar
    var availableProducts: Record<string, RecipeStepProduct> = {};

    for (let i = 0; i < upToStep; i++) {
      const step = recipe.steps[i];

      // add all recipe step products to the record
      step.products.forEach((product: RecipeStepProduct) => {
        if (product.type === 'ingredient') {
          availableProducts[product.name] = product;
        }
      });

      // remove recipe step products that are used in subsequent steps
      step.ingredients.forEach((ingredient: RecipeStepIngredient) => {
        if (ingredient.recipeStepProductID) {
          delete availableProducts[ingredient.name];
        }
      });
    }

    // convert the product creation requests to recipe step products
    const suggestedIngredients: RecipeStepIngredient[] = [];
    for (let p in availableProducts) {
      suggestedIngredients.push(
        new RecipeStepIngredient({
          name: availableProducts[p].name,
          measurementUnit: new ValidMeasurementUnit({ id: availableProducts[p].measurementUnit.id }),
          quantityNotes: availableProducts[p].quantityNotes,
          minimumQuantity: availableProducts[p].minimumQuantity,
        }),
      );
    }

    return suggestedIngredients;
  };

  public static determinePreparedInstrumentOptions = (
    recipe: Recipe,
    stepIndex: number,
  ): Array<RecipeStepInstrument> => {
    var availableInstruments: Record<string, RecipeStepProduct> = {};

    for (let i = 0; i < stepIndex; i++) {
      const step = recipe.steps[i];

      // add all recipe step product instruments to the record
      step.products.forEach((product: RecipeStepProduct) => {
        if (product.type === 'instrument') {
          availableInstruments[product.name] = product;
        }
      });

      // remove recipe step product instruments that are used in subsequent steps
      step.instruments.forEach((instrument: RecipeStepInstrument) => {
        if (instrument.recipeStepProductID) {
          delete availableInstruments[instrument.name];
        }
      });
    }

    // convert the product creation requests to recipe step products
    const suggestions: RecipeStepInstrument[] = [];
    for (let p in availableInstruments) {
      let i = availableInstruments[p];
      suggestions.push({
        ...i,
        optionIndex: 0,
        displayInSummaryLists: false,
        notes: '',
        preferenceRank: 0,
        optional: false,
      });
    }

    return suggestions;
  };
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
