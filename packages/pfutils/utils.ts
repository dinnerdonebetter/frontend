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

const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient): boolean => {
  return Boolean(x.recipeStepProductID) && x.recipeStepProductID !== '';
};

export const getRecipeStepIndexByID = (recipe: Recipe, id: string): number => {
  let retVal = -1;

  (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
    if (step.products.findIndex((product: RecipeStepProduct) => product.id === id) !== -1) {
      retVal = stepIndex + 1;
    }
  });

  return retVal;
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

export const toDAG = (recipe: Recipe): dagre.graphlib.Graph<string> => {
  const nodeWidth = 200;
  const nodeHeight = 50;

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

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export const buildRecipeStepText = (recipe: Recipe, recipeStep: RecipeStep): string => {
  const instrumentList = new Intl.ListFormat('en').format(
    recipeStep.instruments.map((x: RecipeStepInstrument) =>
      x.minimumQuantity === 1
        ? `a ${x.instrument?.name || x.name}`
        : `${x.minimumQuantity}${x.maximumQuantity > x.minimumQuantity ? ` to ${x.maximumQuantity}` : ''} ${
            x.instrument?.pluralName || x.name
          }`,
    ),
  );
  const allInstrumentsShouldBeExcludedFromSummaries = recipeStep.instruments.every(
    (x: RecipeStepInstrument) => x.instrument && x.instrument.displayInSummaryLists,
  );

  const ingredientList = new Intl.ListFormat('en').format(
    recipeStep.ingredients.map((x: RecipeStepIngredient) => {
      let measurementUnit = x.minimumQuantity === 1 ? x.measurementUnit.name : x.measurementUnit.pluralName;
      measurementUnit = measurementUnit === 'unit' ? '' : measurementUnit;

      return `${x.minimumQuantity}${
        x.maximumQuantity > x.minimumQuantity ? ` to ${x.maximumQuantity}` : ''
      } ${measurementUnit} ${
        x.minimumQuantity === 1 ? x.ingredient?.name || x.name : x.ingredient?.pluralName || x.name
      }`;
    }),
  );

  const producttList = new Intl.ListFormat('en').format(
    recipeStep.products.map((x: RecipeStepProduct) => {
      let measurementUnit = x.minimumQuantity === 1 ? x.measurementUnit.name : x.measurementUnit.pluralName;
      measurementUnit = measurementUnit === 'unit' ? '' : measurementUnit;

      return `the ${x.type} ${x.name}`;
    }),
  );

  return (
    `${allInstrumentsShouldBeExcludedFromSummaries ? `Using ${instrumentList}, ` : ''} ${
      allInstrumentsShouldBeExcludedFromSummaries
        ? recipeStep.preparation.name
        : toTitleCase(recipeStep.preparation.name)
    } ${ingredientList}, yielding ${producttList}.` || recipeStep.explicitInstructions
  );
};
