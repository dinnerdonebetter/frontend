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
  MealComponentCreationRequestInput,
} from '@dinnerdonebetter/models';

export const stepElementIsProduct = (x: RecipeStepInstrument | RecipeStepIngredient | RecipeStepVessel): boolean => {
  return Boolean(x.recipeStepProductID) && x.recipeStepProductID !== '';
};

export const getRecipeStepIndexByProductID = (recipe: Recipe, id: string): number => {
  let retVal = -1;

  (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
    if (step.products.findIndex((product: RecipeStepProduct) => product.id === id) !== -1) {
      retVal = stepIndex + 1;
    }
  });

  return retVal;
};

export const getRecipeStepIndexByStepID = (recipe: Recipe, id: string): number => {
  let retVal = -1;

  (recipe.steps || []).forEach((step: RecipeStep, stepIndex: number) => {
    if (step.id === id) {
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

  recipe.steps.forEach((step: RecipeStep) => {
    const stepIndex = (step.index + 1).toString();
    dagreGraph.setNode(stepIndex, { width: nodeWidth, height: nodeHeight });
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
    step.ingredients.forEach((ingredient: RecipeStepIngredientCreationRequestInput) => {
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
    step.instruments.forEach((ingredient: RecipeStepInstrumentCreationRequestInput) => {
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
            mealScale: z.mealScale,
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
    minimumEstimatedPortions: x.minimumEstimatedPortions,
    maximumEstimatedPortions: x.maximumEstimatedPortions,
    recipes: x.components.map(
      (x: MealComponent) =>
        ({
          recipeID: x.recipe.id,
          componentType: x.componentType,
          recipeScale: x.recipeScale,
        } as MealComponentCreationRequestInput),
    ),
  });

  return y;
};

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
            }`) +
        `${elementIsProduct ? ` from step #${getRecipeStepIndexByProductID(recipe, x.recipeStepProductID!)}` : ''}`
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
            }`) +
        `${elementIsProduct ? ` from step #${getRecipeStepIndexByProductID(recipe, x.recipeStepProductID!)}` : ''}`
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
        `${elementIsProduct ? ` from step #${getRecipeStepIndexByProductID(recipe, x.recipeStepProductID!)}` : ''}`
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
        : `a${englishListFormatter.format(
            productMap['instrument'].map(
              (x: RecipeStepProduct) => `${(x.minimumQuantity ?? 1) === 1 ? 'a' : 'the'} ${x.name}`,
            ),
          )}`,
      productMap['vessel'].length <= 0
        ? ''
        : `${englishListFormatter.format(
            productMap['vessel'].map(
              (x: RecipeStepProduct) => `${(x.minimumQuantity ?? 1) === 1 ? 'a' : 'the'} ${x.name}`,
            ),
          )}`,
    ].filter((x: string) => x.length > 0),
  );
  const preparationName = `${recipeStep.preparation.name.charAt(0).toUpperCase()}${recipeStep.preparation.name.slice(
    1,
  )}`;

  const intro = allInstrumentsShouldBeExcludedFromSummaries ? `Using ${instrumentList}, ` : '';

  return (
    `${intro} ${preparationName} ${ingredientList} ${vesselList} to yield ${productList}.` ||
    recipeStep.explicitInstructions
  );
};

export const determineVesselsForRecipes = (recipes: Recipe[]): RecipeStepVessel[] => {
  const allVessels = recipes
    .map((recipe: Recipe) => {
      return (recipe.steps || []).map((x: RecipeStep) => {
        return (x.vessels || []).filter((vessel: RecipeStepVessel) => {
          return (vessel.instrument && vessel.instrument?.displayInSummaryLists) || vessel.recipeStepProductID;
        });
      });
    })
    .flat()
    .flat();

  const uniqueVessels: Record<string, RecipeStepVessel> = {};
  (allVessels || []).map((vessel: RecipeStepVessel) => {
    if (vessel.instrument !== null) {
      if (uniqueVessels.hasOwnProperty(vessel.instrument!.id)) {
        uniqueVessels[vessel.instrument!.id].minimumQuantity += vessel.minimumQuantity;
        if (vessel.maximumQuantity) {
          uniqueVessels[vessel.instrument!.id].maximumQuantity =
            (uniqueVessels[vessel.instrument!.id].maximumQuantity || 0) + vessel.maximumQuantity;
        }
      } else {
        uniqueVessels[vessel.instrument!.id] = vessel;
      }
    }
  });

  return Object.values(uniqueVessels);
};

interface mealRecipeInput {
  scale: number;
  recipe: Recipe;
}

export const determineAllIngredientsForRecipes = (input: mealRecipeInput[]): RecipeStepIngredient[] => {
  const allIngredients = input
    .map((x: mealRecipeInput) => {
      return (x.recipe.steps || []).map((recipeStep: RecipeStep) => {
        const ingredients = (recipeStep.ingredients || []).filter((ingredient) => ingredient.ingredient !== null);

        return ingredients.map((y) => {
          return {
            ...y,
            minimumQuantity: y.minimumQuantity * x.scale,
            maximumQuantity: y.maximumQuantity ? y.maximumQuantity * x.scale : undefined,
          };
        });
      });
    })
    .flat()
    .flat();

  const uniqueIngredients: Record<string, RecipeStepIngredient> = {};
  (allIngredients || []).map((ingredient: RecipeStepIngredient) => {
    if (ingredient.ingredient !== null) {
      if (uniqueIngredients.hasOwnProperty(ingredient.ingredient!.id)) {
        uniqueIngredients[ingredient.ingredient!.id].minimumQuantity += ingredient.minimumQuantity;
        if (ingredient.maximumQuantity) {
          uniqueIngredients[ingredient.ingredient!.id].maximumQuantity =
            (uniqueIngredients[ingredient.ingredient!.id].maximumQuantity || 0) + ingredient.maximumQuantity;
        }
      } else {
        uniqueIngredients[ingredient.ingredient!.id] = ingredient;
      }
    }
  });

  return Object.values(uniqueIngredients);
};

export const determineAllInstrumentsForRecipes = (recipes: Recipe[]): (RecipeStepInstrument | RecipeStepVessel)[] => {
  const uniqueValidInstruments: Record<string, RecipeStepInstrument | RecipeStepVessel> = {};

  (recipes || []).map((recipe: Recipe) => {
    (recipe.steps || []).map((recipeStep: RecipeStep) => {
      (recipeStep.instruments || []).map((instrument: RecipeStepInstrument) => {
        if (instrument.instrument !== null && instrument.instrument!.displayInSummaryLists) {
          uniqueValidInstruments[instrument.instrument!.id] = instrument;
        }
      });

      (recipeStep.vessels || []).map((vessel: RecipeStepVessel) => {
        if (vessel.instrument !== null && vessel.instrument!.displayInSummaryLists) {
          uniqueValidInstruments[vessel.instrument!.id] = vessel;
        }
      });
    });
  });

  return Object.values(uniqueValidInstruments);
};

export const gatherAllPredecessorsForStep = (
  recipeGraph: dagre.graphlib.Graph<string>,
  stepIndex: number,
): string[] => {
  let p: string[] = recipeGraph.predecessors((stepIndex + 1).toString()) || [];

  p.forEach((predecessor: string) => {
    p = p.concat(gatherAllPredecessorsForStep(recipeGraph, parseInt(predecessor, 10) - 1));
  });

  return p;
};

export const recipeStepCanBePerformed = (
  stepIndex: number,
  recipeGraph: dagre.graphlib.Graph<string>,
  stepsNeedingCompletion: boolean[],
): boolean => {
  const performedPredecessors: boolean[] = (gatherAllPredecessorsForStep(recipeGraph, stepIndex) || []).map(
    (node: string) => {
      return stepsNeedingCompletion[parseInt(node, 10) - 1];
    },
  );

  return performedPredecessors.length === 0 ? false : !performedPredecessors.every((element) => element === false);
};

export const getEarliestEvent = (mealPlan: MealPlan) => {
  return mealPlan.events.reduce((earliest, event) => (event.startsAt < earliest.startsAt ? event : earliest));
};

export const getLatestEvent = (mealPlan: MealPlan) => {
  return mealPlan.events.reduce((earliest, event) => (event.startsAt > earliest.startsAt ? event : earliest));
};
