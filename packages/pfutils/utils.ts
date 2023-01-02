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

interface RecipeStepProductCandidate {
  stepIndex: number;
  productIndex: number;
  product: RecipeStepProductCreationRequestInput;
}

export interface RecipeStepProductSuggestion {
  stepIndex: number;
  productIndex: number;
  product: RecipeStepIngredient;
}

export const determineAvailableRecipeStepProducts = (
  recipe: RecipeCreationRequestInput,
  upToStep: number,
): Array<RecipeStepProductSuggestion> => {
  // first we need to determine the available products thusfar
  var availableProducts: Array<RecipeStepProductCandidate> = [];

  for (let stepIndex = 0; stepIndex < upToStep; stepIndex++) {
    const step = recipe.steps[stepIndex];

    // add all recipe step products to the record
    step.products.forEach((product: RecipeStepProductCreationRequestInput, productIndex: number) => {
      if (product.type === 'ingredient') {
        availableProducts.push({
          stepIndex: stepIndex,
          productIndex: productIndex,
          product: product,
        });
      }
    });

    // remove recipe step products that are used in subsequent steps
    step.ingredients.forEach((ingredient: RecipeStepIngredientCreationRequestInput, ingredientIndex: number) => {
      if (ingredient.productOfRecipeStepIndex && ingredient.productOfRecipeStepProductIndex) {
        // remove the element with the corresponding indices
        availableProducts = availableProducts.filter((p) => {
          return (
            p.stepIndex !== ingredient.productOfRecipeStepIndex ||
            p.productIndex !== ingredient.productOfRecipeStepProductIndex
          );
        });
      }
    });
  }

  // convert the product creation requests to recipe step products
  const suggestedIngredients: RecipeStepProductSuggestion[] = [];
  for (let candidateIndex = 0; candidateIndex < availableProducts.length; candidateIndex++) {
    const candidate = availableProducts[candidateIndex];
    suggestedIngredients.push({
      stepIndex: candidate.stepIndex,
      productIndex: candidate.productIndex,
      product: new RecipeStepIngredient({
        name: candidate.product.name,
        measurementUnit: new ValidMeasurementUnit({ id: candidate.product.measurementUnitID }),
        quantityNotes: candidate.product.quantityNotes,
        minimumQuantity: candidate.product.minimumQuantity,
      }),
    });
  }

  return suggestedIngredients;
};

interface RecipeStepInstrumentCandidate {
  stepIndex: number;
  productIndex: number;
  product: RecipeStepProductCreationRequestInput;
}

export interface RecipeStepInstrumentSuggestion {
  stepIndex: number;
  productIndex: number;
  product: RecipeStepInstrument;
}

export const determinePreparedInstrumentOptions = (
  recipe: RecipeCreationRequestInput,
  stepIndex: number,
): Array<RecipeStepInstrumentSuggestion> => {
  var availableInstruments: Array<RecipeStepInstrumentCandidate> = [];

  for (let i = 0; i < stepIndex; i++) {
    const step = recipe.steps[i];

    // add all recipe step product instruments to the record
    step.products.forEach((product: RecipeStepProductCreationRequestInput, productIndex: number) => {
      if (product.type === 'instrument') {
        availableInstruments.push({
          stepIndex: i,
          productIndex: productIndex,
          product,
        });
      }
    });

    // remove recipe step products that are used in subsequent steps
    step.instruments.forEach((ingredient: RecipeStepInstrumentCreationRequestInput, instrumentIndex: number) => {
      if (ingredient.productOfRecipeStepIndex && ingredient.productOfRecipeStepProductIndex) {
        // remove the element with the corresponding indices
        availableInstruments = availableInstruments.filter((p: RecipeStepInstrumentCandidate) => {
          return (
            p.stepIndex !== ingredient.productOfRecipeStepIndex ||
            p.productIndex !== ingredient.productOfRecipeStepProductIndex
          );
        });
      }
    });
  }

  // convert the product creation requests to recipe step products
  const suggestions: RecipeStepInstrumentSuggestion[] = [];
  for (let p in availableInstruments) {
    let i = availableInstruments[p];
    suggestions.push({
      stepIndex: i.stepIndex,
      productIndex: i.productIndex,
      product: new RecipeStepInstrument({
        ...i.product,
        optionIndex: 0,
        notes: '',
        preferenceRank: 0,
        optional: false,
        minimumQuantity: 1,
      }),
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
