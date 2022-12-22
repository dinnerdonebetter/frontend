import { Reducer } from 'react';

import {
  ValidMeasurementUnit,
  ValidPreparation,
  Recipe,
  RecipeStep,
  RecipeStepProduct,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepCompletionCondition,
  ValidIngredientState,
} from '@prixfixeco/models';
import { determineAvailableRecipeStepProducts } from '@prixfixeco/pfutils';

const debugTypes = new Set(['']);

interface queryUpdateData {
  query: string;
  stepIndex: number;
  secondaryIndex?: number;
}

const recipeSubmissionShouldBeDisabled = (pageState: RecipeCreationPageState): boolean => {
  const componentProblems: string[] = [];

  return !(pageState.recipe.name.length > 0 && pageState.recipe.steps.length > 0 && componentProblems.length === 0);
};

type RecipeCreationAction =
  | { type: 'UPDATE_NAME'; newName: string }
  | { type: 'UPDATE_DESCRIPTION'; newDescription: string }
  | { type: 'UPDATE_SOURCE'; newSource: string }
  | { type: 'UPDATE_YIELDS_PORTIONS'; newPortions?: number }
  | { type: 'TOGGLE_SHOW_ALL_INGREDIENTS' }
  | { type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' }
  | { type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' }
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'ADD_STEP' }
  | { type: 'TOGGLE_SHOW_STEP'; stepIndex: number }
  | { type: 'REMOVE_STEP'; stepIndex: number }
  | {
      type: 'ADD_INGREDIENT_TO_STEP';
      stepIndex: number;
      selectedIngredient: RecipeStepIngredient;
      selectedValidIngredient?: RecipeStepIngredient;
    }
  | {
      type: 'ADD_INSTRUMENT_TO_STEP';
      stepIndex: number;
      instrumentName?: string;
      selectedInstrument: RecipeStepInstrument;
    }
  | { type: 'REMOVE_INGREDIENT_FROM_STEP'; stepIndex: number; recipeStepIngredientIndex: number }
  | { type: 'REMOVE_INSTRUMENT_FROM_STEP'; stepIndex: number; recipeStepInstrumentIndex: number }
  | { type: 'UPDATE_STEP_PREPARATION_QUERY'; stepIndex: number; newQuery: string }
  | { type: 'UPDATE_STEP_NOTES'; stepIndex: number; newNotes: string }
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY'; stepIndex: number; newQuery: string }
  | {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY';
      stepIndex: number;
      productIndex: number;
      newQuery: string;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_SUGGESTIONS';
      stepIndex: number;
      productIndex: number;
      results: ValidMeasurementUnit[];
    }
  | {
      type: 'ADD_COMPLETION_CONDITION_TO_STEP';
      stepIndex: number;
    }
  | {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY';
      stepIndex: number;
      conditionIndex: number;
      query: string;
    }
  | {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_SUGGESTIONS';
      stepIndex: number;
      conditionIndex: number;
      results: ValidIngredientState[];
    }
  | {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE';
      stepIndex: number;
      conditionIndex: number;
      ingredientState: ValidIngredientState;
    }
  | {
      type: 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION';
      stepIndex: number;
      conditionIndex: number;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT';
      stepIndex: number;
      productIndex: number;
      measurementUnit: ValidMeasurementUnit;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_TYPE';
      stepIndex: number;
      productIndex: number;
      newType: 'ingredient' | 'instrument';
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_SUGGESTIONS';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      results: ValidMeasurementUnit[];
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      measurementUnit?: ValidMeasurementUnit;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_SUGGESTIONS';
      stepIndex: number;
      results: RecipeStepIngredient[];
    }
  | {
      type: 'UPDATE_STEP_INSTRUMENT_SUGGESTIONS';
      stepIndex: number;
      results: RecipeStepInstrument[];
    }
  | {
      type: 'UPDATE_STEP_PREPARATION_SUGGESTIONS';
      stepIndex: number;
      results: ValidPreparation[];
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      newAmount: number;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      newAmount: number;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY';
      stepIndex: number;
      productIndex: number;
      newAmount: number;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY';
      stepIndex: number;
      productIndex: number;
      newAmount: number;
    }
  | {
      type: 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY';
      stepIndex: number;
      recipeStepInstrumentIndex: number;
      newAmount: number;
    }
  | {
      type: 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY';
      stepIndex: number;
      recipeStepInstrumentIndex: number;
      newAmount: number;
    }
  | {
      type: 'UPDATE_STEP_PREPARATION';
      stepIndex: number;
      selectedPreparation: ValidPreparation;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_NAME';
      newName: string;
      stepIndex: number;
      productIndex: number;
    }
  | { type: 'TOGGLE_INGREDIENT_RANGE'; stepIndex: number; recipeStepIngredientIndex: number }
  | { type: 'TOGGLE_INSTRUMENT_RANGE'; stepIndex: number; recipeStepInstrumentIndex: number }
  | { type: 'TOGGLE_PRODUCT_RANGE'; stepIndex: number; productIndex: number }
  | {
      type: 'TOGGLE_MANUAL_PRODUCT_NAMING';
      stepIndex: number;
      productIndex: number;
    };

export class RecipeCreationPageState {
  submissionShouldBePrevented: boolean = true;
  submissionError: string | null = null;
  showIngredientsSummary: boolean = false;
  showInstrumentsSummary: boolean = false;
  showAdvancedPrepStepInputs: boolean = false;

  recipe: Recipe = new Recipe({
    yieldsPortions: 1,
    steps: [
      new RecipeStep({
        instruments: [],
        ingredients: [],
        products: [new RecipeStepProduct({ minimumQuantity: 1, maximumQuantity: 1, type: 'ingredient' })],
      }),
    ],
  });

  stepHelpers: StepHelper[] = [new StepHelper()];

  completionConditionIngredientStateQueryToExecute: queryUpdateData | null = null;
}

export class StepHelper {
  show: boolean = true;

  instrumentIsRanged: boolean[] = [];
  ingredientIsRanged: boolean[] = [];
  productIsRanged: boolean[] = [false];

  // ingredient measurement units
  ingredientMeasurementUnitSuggestions: ValidMeasurementUnit[][] = [[]];

  // product measurement units
  productMeasurementUnitQueries: string[] = [''];
  productMeasurementUnitSuggestions: ValidMeasurementUnit[][] = [[]];

  // completion condition ingredient states
  completionConditionIngredientStateQueries: string[] = [''];
  completionConditionIngredientStateSuggestions: ValidIngredientState[][] = [[]];

  // preparations
  preparationQuery: string = '';
  preparationSuggestions: ValidPreparation[] = [];

  // ingredients
  ingredientQuery: string = '';
  ingredientSuggestions: RecipeStepIngredient[] = [];

  // instruments
  instrumentSuggestions: RecipeStepInstrument[] = [];

  productsNamedManually: boolean[] = [false];
}

export const useRecipeCreationReducer: Reducer<RecipeCreationPageState, RecipeCreationAction> = (
  state: RecipeCreationPageState,
  action: RecipeCreationAction,
): RecipeCreationPageState => {
  if (debugTypes.has(action.type)) {
    console.debug(`[useRecipeCreationReducer] action: ${JSON.stringify(action)}`);
  }

  let newState: RecipeCreationPageState = { ...state };

  switch (action.type) {
    case 'TOGGLE_SHOW_ALL_INGREDIENTS': {
      newState = {
        ...state,
        showIngredientsSummary: !state.showIngredientsSummary,
      };
      break;
    }

    case 'TOGGLE_SHOW_ALL_INSTRUMENTS': {
      newState = {
        ...state,
        showInstrumentsSummary: !state.showInstrumentsSummary,
      };
      break;
    }

    case 'TOGGLE_SHOW_ADVANCED_PREP_STEPS': {
      newState = {
        ...state,
        showAdvancedPrepStepInputs: !state.showAdvancedPrepStepInputs,
      };
      break;
    }

    case 'UPDATE_SUBMISSION_ERROR': {
      newState = {
        ...state,
        submissionError: action.error,
      };
      break;
    }

    case 'UPDATE_NAME': {
      newState = {
        ...state,
        recipe: { ...state.recipe, name: action.newName },
        submissionShouldBePrevented: recipeSubmissionShouldBeDisabled(state),
      };
      break;
    }

    case 'UPDATE_DESCRIPTION': {
      newState = { ...state, recipe: { ...state.recipe, description: action.newDescription } };
      break;
    }

    case 'UPDATE_SOURCE': {
      newState = { ...state, recipe: { ...state.recipe, source: action.newSource } };
      break;
    }

    case 'UPDATE_YIELDS_PORTIONS': {
      if (action.newPortions) {
        newState = { ...state, recipe: { ...state.recipe, yieldsPortions: action.newPortions } };
      }
      break;
    }

    case 'ADD_STEP': {
      const newStepHelper = new StepHelper();
      newStepHelper.ingredientSuggestions = determineAvailableRecipeStepProducts(
        state.recipe,
        state.recipe.steps.length - 1,
      );

      const newStepHelpers = [...state.stepHelpers, newStepHelper];

      newState = {
        ...state,
        stepHelpers: newStepHelpers,
        recipe: {
          ...state.recipe,
          steps: [
            ...state.recipe.steps,
            new RecipeStep({
              media: [],
              instruments: [],
              ingredients: [],
              products: [
                new RecipeStepProduct({
                  minimumQuantity: 1,
                }),
              ],
              completionConditions: [],
            }),
          ],
        },
      };
      break;
    }

    case 'REMOVE_STEP': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.filter((x: StepHelper, i: number) => i !== action.stepIndex),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.filter((_step: RecipeStep, index: number) => index !== action.stepIndex),
        },
      };
      break;
    }

    case 'TOGGLE_SHOW_STEP': {
      const newStepHelpers = [...state.stepHelpers];
      newStepHelpers[action.stepIndex] = {
        ...newStepHelpers[action.stepIndex],
        show: !newStepHelpers[action.stepIndex].show,
      };

      newState = {
        ...state,
        stepHelpers: newStepHelpers,
      };
      break;
    }

    case 'ADD_INGREDIENT_TO_STEP': {
      const buildNewIngredients = (): RecipeStepIngredient[] => {
        return [
          ...state.recipe.steps[action.stepIndex].ingredients,
          new RecipeStepIngredient({
            name: action.selectedIngredient!.name,
            ingredient: action.selectedValidIngredient?.ingredient,
            measurementUnit: action.selectedIngredient!.measurementUnit,
            minimumQuantity: action.selectedIngredient!.minimumQuantity,
            maximumQuantity: action.selectedIngredient!.maximumQuantity,
          }),
        ];
      };

      const ingredientList = new Intl.ListFormat('en').format(
        buildNewIngredients().map((x: RecipeStepIngredient) => x.ingredient?.name || x.name),
      );

      const buildNewRecipeStepProducts = (): RecipeStepProduct[] => {
        const newRecipeStepProducts: RecipeStepProduct[] = [...state.recipe.steps[action.stepIndex].products];

        if (newRecipeStepProducts.length === 1) {
          // TODO: check we're not setting the name of this product manually
          newRecipeStepProducts[0].name = `${
            state.recipe.steps[action.stepIndex].preparation.pastTense
          } ${ingredientList}`;
        }

        return newRecipeStepProducts;
      };

      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                ingredientIsRanged: [...(stepHelper.ingredientIsRanged || []), false],
                ingredientQuery: '',
                ingredientMeasurementUnitSuggestions: [...(stepHelper.ingredientMeasurementUnitSuggestions || []), []],
              }
            : stepHelper;
        }),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  ingredients: buildNewIngredients(),
                  products: buildNewRecipeStepProducts(),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'REMOVE_INGREDIENT_FROM_STEP': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  ingredients: step.ingredients.filter(
                    (_ingredient: RecipeStepIngredient, recipeStepIngredientIndex: number) =>
                      recipeStepIngredientIndex !== action.recipeStepIngredientIndex,
                  ),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'ADD_INSTRUMENT_TO_STEP': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                instrumentIsRanged: [...(stepHelper.instrumentIsRanged || []), false],
              }
            : stepHelper;
        }),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  instruments: [...step.instruments, action.selectedInstrument],
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'REMOVE_INSTRUMENT_FROM_STEP': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                instrumentIsRanged: stepHelper.instrumentIsRanged.filter(
                  (_isRanged: boolean, instrumentIndex: number) => instrumentIndex !== action.recipeStepInstrumentIndex,
                ),
              }
            : stepHelper;
        }),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  instruments: step.instruments.filter(
                    (_instrument: RecipeStepInstrument, instrumentIndex: number) =>
                      instrumentIndex !== action.recipeStepInstrumentIndex,
                  ),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_SUGGESTIONS': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                ingredientSuggestions: action.results || [],
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_SUGGESTIONS': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                instrumentSuggestions: action.results || [],
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_STEP_PREPARATION_QUERY': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                preparationQuery: action.newQuery,
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_STEP_PREPARATION_SUGGESTIONS': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                preparationSuggestions: action.results || [],
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_SUGGESTIONS': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                ingredientMeasurementUnitSuggestions: stepHelper.ingredientMeasurementUnitSuggestions.map(
                  (suggestions: ValidMeasurementUnit[], ingredientIndex: number) => {
                    return ingredientIndex === action.recipeStepIngredientIndex ? action.results || [] : suggestions;
                  },
                ),
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                productMeasurementUnitQueries: stepHelper.productMeasurementUnitQueries.map(
                  (query: string, productIndex: number) => {
                    return productIndex === action.productIndex ? action.newQuery : query;
                  },
                ),
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_SUGGESTIONS': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                productMeasurementUnitSuggestions: stepHelper.productMeasurementUnitSuggestions.map(
                  (suggestions: ValidMeasurementUnit[], productIndex: number) => {
                    return productIndex === action.productIndex ? action.results || [] : suggestions;
                  },
                ),
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'ADD_COMPLETION_CONDITION_TO_STEP': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                completionConditionIngredientStateQueries: [
                  ...stepHelper.completionConditionIngredientStateQueries,
                  '',
                ],
                completionConditionIngredientStateSuggestions: [
                  ...stepHelper.completionConditionIngredientStateSuggestions,
                  [],
                ],
              }
            : stepHelper;
        }),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  completionConditions: [...step.completionConditions, new RecipeStepCompletionCondition()],
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                completionConditionIngredientStateQueries: stepHelper.completionConditionIngredientStateQueries.map(
                  (query: string, conditionIndex: number) => {
                    return conditionIndex === action.conditionIndex ? action.query : query;
                  },
                ),
              }
            : stepHelper;
        }),
        completionConditionIngredientStateQueryToExecute: {
          query: action.query,
          stepIndex: action.stepIndex,
          secondaryIndex: action.conditionIndex,
        },
      };
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_SUGGESTIONS': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                completionConditionIngredientStateSuggestions:
                  stepHelper.completionConditionIngredientStateSuggestions.map(
                    (suggestions: ValidIngredientState[], conditionIndex: number) => {
                      return conditionIndex === action.conditionIndex ? action.results || [] : suggestions;
                    },
                  ),
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE': {
      if (!action.ingredientState) {
        console.error("couldn't find ingredient state to add");
        break;
      }

      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  completionConditions: step.completionConditions.map(
                    (completionCondition: RecipeStepCompletionCondition, conditionIndex: number) => {
                      return conditionIndex === action.conditionIndex
                        ? {
                            ...completionCondition,
                            ingredientState: action.ingredientState!,
                          }
                        : completionCondition;
                    },
                  ),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                completionConditionIngredientStateQueries: stepHelper.completionConditionIngredientStateQueries.filter(
                  (_: string, conditionIndex: number) => conditionIndex !== action.conditionIndex,
                ),
                completionConditionIngredientStateSuggestions:
                  stepHelper.completionConditionIngredientStateSuggestions.filter(
                    (_: ValidIngredientState[], conditionIndex: number) => conditionIndex !== action.conditionIndex,
                  ),
              }
            : stepHelper;
        }),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  completionConditions: step.completionConditions.filter(
                    (_: RecipeStepCompletionCondition, conditionIndex: number) =>
                      conditionIndex !== action.conditionIndex,
                  ),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT': {
      if (!action.measurementUnit) {
        console.error("couldn't find measurement unit to add for step ingredient");
        break;
      }

      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  ingredients: step.ingredients.map((ingredient: RecipeStepIngredient, ingredientIndex: number) => {
                    return ingredientIndex === action.recipeStepIngredientIndex
                      ? {
                          ...ingredient,
                          measurementUnit: action.measurementUnit!,
                        }
                      : ingredient;
                  }),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT': {
      if (!action.measurementUnit) {
        console.error("couldn't find measurement unit to add");
        break;
      }

      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  products: step.products.map((product: RecipeStepProduct, productIndex: number) => {
                    return productIndex === action.productIndex
                      ? {
                          ...product,
                          measurementUnit: action.measurementUnit!,
                        }
                      : product;
                  }),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_PRODUCT_TYPE': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  products: step.products.map((product: RecipeStepProduct, productIndex: number) => {
                    return productIndex === action.productIndex
                      ? {
                          ...product,
                          measurementUnit: new ValidMeasurementUnit(),
                          minimumQuantity: 1,
                          type: action.newType,
                        }
                      : product;
                  }),
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  ingredients: step.ingredients.map((ingredient: RecipeStepIngredient, ingredientIndex: number) => {
                    return ingredientIndex === action.recipeStepIngredientIndex
                      ? {
                          ...ingredient,
                          minimumQuantity: action.newAmount,
                        }
                      : ingredient;
                  }),
                }
              : step;
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  ingredients: step.ingredients.map((ingredient: RecipeStepIngredient, ingredientIndex: number) => {
                    return ingredientIndex === action.recipeStepIngredientIndex
                      ? {
                          ...ingredient,
                          maximumQuantity: Math.max(action.newAmount, ingredient.minimumQuantity),
                        }
                      : ingredient;
                  }),
                }
              : step;
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  products: step.products.map((product: RecipeStepProduct, productIndex: number) => {
                    return productIndex === action.productIndex
                      ? {
                          ...product,
                          minimumQuantity: action.newAmount,
                        }
                      : product;
                  }),
                }
              : step;
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  products: step.products.map((product: RecipeStepProduct, productIndex: number) => {
                    return productIndex === action.productIndex
                      ? {
                          ...product,
                          maximumQuantity: Math.max(action.newAmount, product.minimumQuantity),
                        }
                      : product;
                  }),
                }
              : step;
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  instruments: step.instruments.map((instrument: RecipeStepInstrument, instrumentIndex: number) => {
                    return instrumentIndex === action.recipeStepInstrumentIndex
                      ? {
                          ...instrument,
                          minimumQuantity: action.newAmount,
                        }
                      : instrument;
                  }),
                }
              : step;
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  instruments: step.instruments.map((instrument: RecipeStepInstrument, instrumentIndex: number) => {
                    return instrumentIndex === action.recipeStepInstrumentIndex
                      ? {
                          ...instrument,
                          maximumQuantity: Math.max(action.newAmount, instrument.minimumQuantity),
                        }
                      : instrument;
                  }),
                }
              : step;
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_PRODUCT_NAME': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep) => {
            return {
              ...step,
              products: step.products.map((product: RecipeStepProduct, productIndex: number) => {
                return productIndex === action.productIndex
                  ? {
                      ...product,
                      name: action.newName,
                    }
                  : product;
              }),
            };
          }),
        },
      };

      break;
    }

    case 'UPDATE_STEP_PREPARATION': {
      // we need to effectively reset the step, since the preparation is the root.
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  preparation: action.selectedPreparation,
                  instruments: [],
                  products: [
                    new RecipeStepProduct({
                      minimumQuantity: 1,
                    }),
                  ],
                  ingredients: [],
                  completionConditions: [],
                }
              : step;
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_NOTES': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
            return index !== action.stepIndex ? step : { ...step, notes: action.newNotes };
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_QUERY': {
      const newStepHelpers = [...state.stepHelpers];
      newStepHelpers[action.stepIndex].ingredientQuery = action.newQuery;

      newState = {
        ...state,
        stepHelpers: newStepHelpers,
      };
      break;
    }

    case 'TOGGLE_INGREDIENT_RANGE': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                ingredientIsRanged: stepHelper.ingredientIsRanged.map(
                  (ingredientIsRanged: boolean, ingredientIndex: number) => {
                    return ingredientIndex === action.recipeStepIngredientIndex
                      ? !ingredientIsRanged
                      : ingredientIsRanged;
                  },
                ),
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'TOGGLE_INSTRUMENT_RANGE': {
      newState = {
        ...state,
        stepHelpers: state.stepHelpers.map((stepHelper: StepHelper, stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? {
                ...stepHelper,
                instrumentIsRanged: stepHelper.instrumentIsRanged.map(
                  (instrumentIsRanged: boolean, instrumentIndex: number) => {
                    return instrumentIndex === action.recipeStepInstrumentIndex
                      ? !instrumentIsRanged
                      : instrumentIsRanged;
                  },
                ),
              }
            : stepHelper;
        }),
      };
      break;
    }

    case 'TOGGLE_PRODUCT_RANGE': {
      const newStepHelpers = [...state.stepHelpers];
      newStepHelpers[action.stepIndex].productIsRanged[action.productIndex] =
        !newStepHelpers[action.stepIndex].productIsRanged[action.productIndex];

      newState = {
        ...state,
        stepHelpers: newStepHelpers,
      };
      break;
    }

    case 'TOGGLE_MANUAL_PRODUCT_NAMING': {
      const newRecipe = { ...state.recipe };
      newRecipe.steps[action.stepIndex].products[action.productIndex].name = '';

      const newStepHelpers = [...state.stepHelpers];
      newStepHelpers[action.stepIndex].productsNamedManually[action.productIndex] =
        !newStepHelpers[action.stepIndex].productsNamedManually[action.productIndex];

      newState = {
        ...state,
        stepHelpers: newStepHelpers,
        recipe: newRecipe,
      };
      break;
    }

    default:
      console.error(`Unhandled action type`);
  }

  if (debugTypes.has(action.type)) {
    console.debug(`[useRecipeCreationReducer] returned state: ${JSON.stringify(newState)}`);
  }

  return newState;
};
