import dagre from 'dagre';

import {
  ValidMeasurementUnit,
  Recipe,
  RecipeStep,
  RecipeStepProduct,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeCreationRequestInput,
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

export const toDAG = (recipe: Recipe): dagre.graphlib.Graph<string> => {
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
};

export const determineAvailableRecipeStepProducts = (
  recipe: RecipeCreationRequestInput,
  upToStep: number,
): Array<RecipeStepIngredient> => {
  // first we need to determine the available products thusfar
  var availableProducts: Record<string, RecipeStepProductCreationRequestInput> = {};

  for (let i = 0; i < upToStep; i++) {
    const step = recipe.steps[i];

    // add all recipe step products to the record
    step.products.forEach((product: RecipeStepProductCreationRequestInput) => {
      if (product.type === 'ingredient') {
        availableProducts[product.name] = product;
      }
    });

    // remove recipe step products that are used in subsequent steps
    step.ingredients.forEach((ingredient: RecipeStepIngredientCreationRequestInput) => {
      if (ingredient.productOfRecipeStepProductIndex !== null) {
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
        measurementUnit: new ValidMeasurementUnit({ id: availableProducts[p].measurementUnitID }),
        quantityNotes: availableProducts[p].quantityNotes,
        minimumQuantity: availableProducts[p].minimumQuantity,
      }),
    );
  }

  return suggestedIngredients;
};

export const determinePreparedInstrumentOptions = (
  recipe: RecipeCreationRequestInput,
  stepIndex: number,
): Array<RecipeStepInstrumentCreationRequestInput> => {
  var availableInstruments: Record<string, RecipeStepProductCreationRequestInput> = {};

  for (let i = 0; i < stepIndex; i++) {
    const step = recipe.steps[i];

    // add all recipe step product instruments to the record
    step.products.forEach((product: RecipeStepProductCreationRequestInput) => {
      if (product.type === 'instrument') {
        availableInstruments[product.name] = product;
      }
    });

    // remove recipe step product instruments that are used in subsequent steps
    step.instruments.forEach((instrument: RecipeStepInstrumentCreationRequestInput) => {
      if (instrument.recipeStepProductID) {
        delete availableInstruments[instrument.name];
      }
    });
  }

  // convert the product creation requests to recipe step products
  const suggestions: RecipeStepInstrumentCreationRequestInput[] = [];
  for (let p in availableInstruments) {
    let i = availableInstruments[p];
    suggestions.push({
      ...i,
      optionIndex: 0,
      notes: '',
      preferenceRank: 0,
      optional: false,
      minimumQuantity: 1,
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
      componentType: x.componentType,
    })),
  });

  return y;
};
