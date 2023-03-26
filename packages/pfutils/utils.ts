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
  RecipeStepVessel,
  RecipeStepVesselCreationRequestInput,
  ValidRecipeStepProductType,
} from '@prixfixeco/models';

export const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient | RecipeStepVessel): boolean => {
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
      if (
        ingredient.productOfRecipeStepIndex !== undefined &&
        ingredient.productOfRecipeStepProductIndex !== undefined
      ) {
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
      if (
        ingredient.productOfRecipeStepIndex !== undefined &&
        ingredient.productOfRecipeStepProductIndex !== undefined
      ) {
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

interface RecipeStepVesselCandidate {
  stepIndex: number;
  productIndex: number;
  product: RecipeStepProductCreationRequestInput;
}

export interface RecipeStepVesselSuggestion {
  stepIndex: number;
  productIndex: number;
  vessel: RecipeStepVessel;
}

export const determineAvailableRecipeStepVessels = (
  recipe: RecipeCreationRequestInput,
  upToStep: number,
): Array<RecipeStepVesselSuggestion> => {
  // first we need to determine the available products thusfar
  var availableVessels: Array<RecipeStepVesselCandidate> = [];

  for (let stepIndex = 0; stepIndex < upToStep; stepIndex++) {
    const step = recipe.steps[stepIndex];

    // add all recipe step products to the record
    step.products.forEach((product: RecipeStepProductCreationRequestInput, productIndex: number) => {
      if (product.type === 'vessel') {
        availableVessels.push({
          stepIndex: stepIndex,
          productIndex: productIndex,
          product: product,
        });
      }
    });

    // remove recipe step products that are used in subsequent steps
    step.vessels.forEach((vessel: RecipeStepVesselCreationRequestInput) => {
      if (vessel.productOfRecipeStepIndex !== undefined && vessel.productOfRecipeStepProductIndex !== undefined) {
        // remove the element with the corresponding indices
        availableVessels = availableVessels.filter((p) => {
          return (
            p.stepIndex !== vessel.productOfRecipeStepIndex || p.productIndex !== vessel.productOfRecipeStepProductIndex
          );
        });
      }
    });
  }

  // convert the product creation requests to recipe step products
  const suggestedVessels: RecipeStepVesselSuggestion[] = [];
  for (let candidateIndex = 0; candidateIndex < availableVessels.length; candidateIndex++) {
    const candidate = availableVessels[candidateIndex];
    suggestedVessels.push({
      stepIndex: candidate.stepIndex,
      productIndex: candidate.productIndex,
      vessel: new RecipeStepVessel({
        name: candidate.product.name,
        minimumQuantity: candidate.product.minimumQuantity,
      }),
    });
  }

  return suggestedVessels;
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

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

export const cleanFloat = (float: number): number => {
  return parseFloat(float.toFixed(2));
};

const englishListFormatter = new Intl.ListFormat('en');

export const buildRecipeStepText = (recipe: Recipe, recipeStep: RecipeStep, recipeScale: number = 1): string => {
  const vesselList = englishListFormatter.format(
    (recipeStep.vessels || []).map((x: RecipeStepVessel) => {
      const elementIsProduct = stepElementIsProduct(x);
      return (
        (x.minimumQuantity === 1
          ? `${x.vesselPreposition ? `${x.vesselPreposition} ` : ''}${elementIsProduct ? 'the' : 'a'} ${
              x.instrument?.name || x.name
            }`
          : `${x.minimumQuantity}${(x.maximumQuantity ?? -1) > x.minimumQuantity ? ` to ${x.maximumQuantity}` : ''} ${
              x.instrument?.pluralName || x.name
            }`) + `${elementIsProduct ? ` from step #${getRecipeStepIndexByID(recipe, x.recipeStepProductID!)}` : ''}`
      );
    }),
  );

  const instrumentList = englishListFormatter.format(
    (recipeStep.instruments || []).map((x: RecipeStepInstrument) => {
      const elementIsProduct = stepElementIsProduct(x);
      return (
        (x.minimumQuantity === 1
          ? `${elementIsProduct ? 'the' : 'a'} ${x.instrument?.name || x.name}`
          : `${x.minimumQuantity}${(x.maximumQuantity ?? -1) > x.minimumQuantity ? ` to ${x.maximumQuantity}` : ''} ${
              x.instrument?.pluralName || x.name
            }`) + `${elementIsProduct ? ` from step #${getRecipeStepIndexByID(recipe, x.recipeStepProductID!)}` : ''}`
      );
    }),
  );

  const allInstrumentsShouldBeExcludedFromSummaries = recipeStep.instruments.every(
    (x: RecipeStepInstrument) => !x.instrument || x.instrument.displayInSummaryLists,
  );

  const ingredientList = englishListFormatter.format(
    (recipeStep.ingredients || []).map((x: RecipeStepIngredient) => {
      const elementIsProduct = stepElementIsProduct(x);
      let measurementUnit =
        cleanFloat(x.minimumQuantity * recipeScale) === 1 ? x.measurementUnit.name : x.measurementUnit.pluralName;
      measurementUnit = ['unit', 'units'].includes(measurementUnit) ? '' : measurementUnit;

      const intro = elementIsProduct
        ? ''
        : `${cleanFloat(x.minimumQuantity * recipeScale)}${
            (x.maximumQuantity ?? -1) > x.minimumQuantity
              ? ` to ${cleanFloat((x.maximumQuantity ?? 0) * recipeScale)} `
              : ''
          } ${measurementUnit}`;

      const name =
        cleanFloat(x.minimumQuantity * recipeScale) === 1
          ? x.ingredient?.name || x.name
          : x.ingredient?.pluralName || x.name;

      return (
        `${intro} ${elementIsProduct ? 'the' : ''} ${name}` +
        `${elementIsProduct ? ` from step #${getRecipeStepIndexByID(recipe, x.recipeStepProductID!)}` : ''}`
      );
    }),
  );

  const productMap: Record<ValidRecipeStepProductType, RecipeStepProduct[]> = {
    ingredient: [],
    instrument: [],
    vessel: [],
  };
  recipeStep.products.map((x: RecipeStepProduct) => {
    productMap[x.type].push(x);
  });

  // loop through the product types to yield strings that say "yield the ingredients a, b, and c, the instruments d and e, and the vessels f and g"
  const productList = englishListFormatter.format(
    [
      productMap['ingredient'].length <= 0
        ? ''
        : `the ${productMap['ingredient'].length === 1 ? 'ingredient' : 'ingredients'} ${englishListFormatter.format(
            productMap['ingredient'].map((x: RecipeStepProduct) => x.name),
          )}`,
      productMap['instrument'].length <= 0
        ? ''
        : `the ${productMap['instrument'].length === 1 ? 'instrument' : 'instruments'} ${englishListFormatter.format(
            productMap['instrument'].map((x: RecipeStepProduct) => x.name),
          )}`,
      productMap['vessel'].length <= 0
        ? ''
        : `the ${productMap['vessel'].length === 1 ? 'vessel' : 'vessels'} ${englishListFormatter.format(
            productMap['vessel'].map((x: RecipeStepProduct) => x.name),
          )}`,
    ].filter((x: string) => x.length > 0),
  );
  const preparationName = allInstrumentsShouldBeExcludedFromSummaries
    ? recipeStep.preparation.name
    : toTitleCase(recipeStep.preparation.name);

  const intro = allInstrumentsShouldBeExcludedFromSummaries ? `Using ${instrumentList}, ` : '';

  return (
    `${intro} ${preparationName} ${ingredientList} ${vesselList} to yield ${productList}.` ||
    recipeStep.explicitInstructions
  );
};
