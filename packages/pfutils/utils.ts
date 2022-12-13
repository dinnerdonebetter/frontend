import dagre from 'dagre';

import {
  ValidMeasurementUnit,
  Recipe,
  RecipeStep,
  RecipeStepProduct,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeCreationRequestInput,
  RecipePrepTask,
  RecipePrepTaskCreationRequestInput,
  RecipeStepCompletionCondition,
  RecipeStepCompletionConditionCreationRequestInput,
  RecipeStepCompletionConditionIngredient,
  RecipeStepCompletionConditionIngredientCreationRequestInput,
  RecipeStepCreationRequestInput,
  RecipeStepIngredientCreationRequestInput,
  RecipeStepInstrumentCreationRequestInput,
  RecipeStepProductCreationRequestInput,
  MealPlan,
  MealPlanCreationRequestInput,
  MealPlanEvent,
  MealPlanEventCreationRequestInput,
  MealPlanOption,
  MealPlanOptionCreationRequestInput,
  Meal,
  MealComponent,
  MealCreationRequestInput,
} from '@prixfixeco/models';

export const ConvertRecipeToRecipeCreationRequestInput = (x: Recipe): RecipeCreationRequestInput => {
  const input = new RecipeCreationRequestInput({
    inspiredByRecipeID: x.inspiredByRecipeID,
    name: x.name,
    source: x.source,
    description: x.description,
    yieldsPortions: x.yieldsPortions,
    sealOfApproval: x.sealOfApproval,
    // FIXME
    // prepTasks: x.prepTasks.map((y: RecipePrepTask) => {
    //   return new RecipePrepTaskCreationRequestInput({
    //     notes: y.notes,
    //     explicitStorageInstructions: y.explicitStorageInstructions,
    //     storageType: y.storageType,
    //     belongsToRecipe: y.belongsToRecipe,
    //     recipeSteps: y.recipeSteps,
    //     minimumTimeBufferBeforeRecipeInSeconds: y.minimumTimeBufferBeforeRecipeInSeconds,
    //     maximumStorageTemperatureInCelsius: y.maximumStorageTemperatureInCelsius,
    //     maximumTimeBufferBeforeRecipeInSeconds: y.maximumTimeBufferBeforeRecipeInSeconds,
    //     minimumStorageTemperatureInCelsius: y.minimumStorageTemperatureInCelsius,
    //   });
    // }),
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
        // FIXME
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
};

export const toDAG = (recipe: Recipe): dagre.graphlib.Graph<string> => {
  const nodeWidth = 200;
  const nodeHeight = 50;

  const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient): boolean => {
    return Boolean(x.productOfRecipeStep) && Boolean(x.recipeStepProductID) && x.recipeStepProductID !== '';
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
};

export const determineAvailableRecipeStepProducts = (recipe: Recipe, upToStep: number): Array<RecipeStepIngredient> => {
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
      if (ingredient.productOfRecipeStep) {
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

export const determinePreparedInstrumentOptions = (recipe: Recipe, stepIndex: number): Array<RecipeStepInstrument> => {
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
      if (instrument.productOfRecipeStep) {
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
      notes: '',
      preferenceRank: 0,
      optional: false,
      productOfRecipeStep: false,
    });
  }

  return suggestions;
};

export const ConvertMealPlanToMealPlanCreationRequestInput = (x: MealPlan): MealPlanCreationRequestInput => {
  const y = new MealPlanCreationRequestInput({
    notes: x.notes,
    votingDeadline: x.votingDeadline,
    events: x.events.map((y: MealPlanEvent) => {
      return new MealPlanEventCreationRequestInput({
        notes: y.notes,
        mealName: y.mealName,
        startsAt: y.startsAt,
        endsAt: y.endsAt,
        options: y.options.map((z: MealPlanOption) => {
          return new MealPlanOptionCreationRequestInput({
            mealID: z.meal.id,
            notes: z.notes,
            assignedCook: z.assignedCook,
            assignedDishwasher: z.assignedDishwasher,
          });
        }),
      });
    }),
  });

  return y;
};

export const ConvertMealToMealCreationRequestInput = (x: Meal): MealCreationRequestInput => {
  const y = new MealCreationRequestInput({
    name: x.name,
    description: x.description,
    recipes: x.components.map((x: MealComponent) => ({
      recipeID: x.recipe.id,
      mealComponentType: x.componentType,
    })),
  });

  return y;
};
