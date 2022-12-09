import { Reducer } from 'react';

import {
  ValidMeasurementUnit,
  ValidPreparation,
  Recipe,
  RecipeStep,
  RecipeStepProduct,
  RecipeStepIngredient,
  RecipeStepInstrument,
  ValidRecipeStepProductType,
  RecipeStepCompletionCondition,
  ValidIngredientState,
} from '@prixfixeco/models';

const debugTypes = new Set(['UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT']);

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
  | { type: 'TOGGLE_SHOW_ALL_INGREDIENTS' }
  | { type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' }
  | { type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' }
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'UPDATE_NAME'; newName: string }
  | { type: 'UPDATE_DESCRIPTION'; newDescription: string }
  | { type: 'UPDATE_SOURCE'; newSource: string }
  | { type: 'UPDATE_YIELDS_PORTIONS'; newPortions?: number }
  | { type: 'ADD_STEP' }
  | { type: 'TOGGLE_SHOW_STEP'; stepIndex: number }
  | { type: 'REMOVE_STEP'; stepIndex: number }
  | { type: 'ADD_INGREDIENT_TO_STEP'; stepIndex: number; ingredientName: string }
  | { type: 'ADD_INSTRUMENT_TO_STEP'; stepIndex: number; instrumentName: string }
  | { type: 'REMOVE_INGREDIENT_FROM_STEP'; stepIndex: number; recipeStepIngredientIndex: number }
  | { type: 'REMOVE_INSTRUMENT_FROM_STEP'; stepIndex: number; recipeStepInstrumentIndex: number }
  | { type: 'UPDATE_STEP_PREPARATION_QUERY'; stepIndex: number; newQuery: string }
  | { type: 'UPDATE_STEP_NOTES'; stepIndex: number; newDescription: string }
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY'; stepIndex: number; newQuery: string }
  | {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY';
      stepIndex: number;
      productIndex: number;
      query: string;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY_RESULTS';
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
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY_RESULTS';
      stepIndex: number;
      conditionIndex: number;
      results: ValidIngredientState[];
    }
  | {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE';
      stepIndex: number;
      conditionIndex: number;
      ingredientState?: ValidIngredientState;
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
      measurementUnit?: ValidMeasurementUnit;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_TYPE';
      stepIndex: number;
      productIndex: number;
      newType: ValidRecipeStepProductType;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY';
      newQuery: string;
      stepIndex: number;
      recipeStepIngredientIndex: number;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS';
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
      type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS';
      stepIndex: number;
      results: RecipeStepIngredient[];
    }
  | {
      type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS';
      stepIndex: number;
      results: RecipeStepInstrument[];
    }
  | {
      type: 'UPDATE_STEP_PREPARATION_QUERY_RESULTS';
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
      preparationName: string;
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
  showSteps: boolean[] = [true];

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

  instrumentIsRanged: boolean[][] = [];
  ingredientIsRanged: boolean[][] = [];
  productIsRanged: boolean[][] = [[false]];

  // ingredient measurement units
  ingredientMeasurementUnitQueries: string[][] = [];
  ingredientMeasurementUnitQueryToExecute: queryUpdateData | null = null;
  ingredientMeasurementUnitSuggestions: ValidMeasurementUnit[][][] = [[]];

  // product measurement units
  productMeasurementUnitQueries: string[][] = [['']];
  productMeasurementUnitQueryToExecute: queryUpdateData | null = null;
  productMeasurementUnitSuggestions: ValidMeasurementUnit[][][] = [[[]]];

  // completion condition ingredient states
  completionConditionIngredientStateQueries: string[][] = [['']];
  completionConditionIngredientStateQueryToExecute: queryUpdateData | null = null;
  completionConditionIngredientStateSuggestions: ValidIngredientState[][][] = [[[]]];

  // preparations
  preparationQueries: string[] = [''];
  preparationQueryToExecute: queryUpdateData | null = null;
  preparationSuggestions: ValidPreparation[][] = [[]];

  // ingredients
  ingredientQueries: string[] = [''];
  ingredientQueryToExecute: queryUpdateData | null = null;
  ingredientSuggestions: RecipeStepIngredient[][] = [[]];

  // instruments
  instrumentQueryToExecute: queryUpdateData | null = null;
  instrumentSuggestions: RecipeStepInstrument[][] = [[]];

  productsNamedManually: boolean[][] = [[true]];
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
      newState = {
        ...state,
        showSteps: [...state.showSteps, true],
        ingredientQueries: [...state.ingredientQueries, ''],
        ingredientSuggestions: [
          ...state.ingredientSuggestions,
          Recipe.determineAvailableRecipeStepProducts(state.recipe, state.recipe.steps.length - 1),
        ],
        preparationQueries: [...state.preparationQueries, ''],
        preparationSuggestions: [...state.preparationSuggestions, []],
        instrumentSuggestions: [...state.instrumentSuggestions, []],
        productsNamedManually: [...state.productsNamedManually, [true]],
        productMeasurementUnitQueries: [...state.productMeasurementUnitQueries, ['']],
        productMeasurementUnitSuggestions: [...state.productMeasurementUnitSuggestions, [[]]],
        completionConditionIngredientStateQueries: [...state.completionConditionIngredientStateQueries, ['']],
        completionConditionIngredientStateSuggestions: [...state.completionConditionIngredientStateSuggestions, [[]]],
        productIsRanged: [...state.productIsRanged, [false]],
        ingredientMeasurementUnitQueries: [...state.ingredientMeasurementUnitQueries, ['']],
        ingredientMeasurementUnitSuggestions: [...state.ingredientMeasurementUnitSuggestions, [[]]],
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
        showSteps: state.showSteps.filter((x: boolean, i: number) => i !== action.stepIndex),
        ingredientQueries: state.ingredientQueries.filter((x: string, i: number) => i !== action.stepIndex),
        ingredientSuggestions: state.ingredientSuggestions.filter(
          (x: RecipeStepIngredient[], i: number) => i !== action.stepIndex,
        ),
        preparationQueries: state.preparationQueries.filter((x: string, i: number) => i !== action.stepIndex),
        preparationSuggestions: state.preparationSuggestions.filter(
          (x: ValidPreparation[], i: number) => i !== action.stepIndex,
        ),
        instrumentSuggestions: state.instrumentSuggestions.filter(
          (x: RecipeStepInstrument[], i: number) => i !== action.stepIndex,
        ),
        productsNamedManually: state.productsNamedManually.filter((x: boolean[], i: number) => i !== action.stepIndex),
        productMeasurementUnitQueries: state.productMeasurementUnitQueries.filter(
          (x: string[], i: number) => i !== action.stepIndex,
        ),
        productMeasurementUnitSuggestions: state.productMeasurementUnitSuggestions.filter(
          (x: ValidMeasurementUnit[][], i: number) => i !== action.stepIndex,
        ),
        completionConditionIngredientStateQueries: state.completionConditionIngredientStateQueries.filter(
          (x: string[], i: number) => i !== action.stepIndex,
        ),
        completionConditionIngredientStateSuggestions: state.completionConditionIngredientStateSuggestions.filter(
          (x: ValidIngredientState[][], i: number) => i !== action.stepIndex,
        ),
        productIsRanged: state.productIsRanged.filter((x: boolean[], i: number) => i !== action.stepIndex),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.filter((_step: RecipeStep, index: number) => index !== action.stepIndex),
        },
      };
      break;
    }

    case 'TOGGLE_SHOW_STEP': {
      newState = {
        ...state,
        showSteps: state.showSteps.map((x: boolean, i: number) => (i === action.stepIndex ? !x : x)),
      };
      break;
    }

    case 'ADD_INGREDIENT_TO_STEP': {
      const selectedValidIngredient = (state.ingredientSuggestions[action.stepIndex] || []).find(
        (ingredientSuggestion: RecipeStepIngredient) => ingredientSuggestion.ingredient?.name === action.ingredientName,
      );

      const selectedRecipeStepProduct = (
        Recipe.determineAvailableRecipeStepProducts(state.recipe, action.stepIndex) || []
      ).find((recipeStepProduct: RecipeStepIngredient) => recipeStepProduct.name === action.ingredientName);

      if (!selectedValidIngredient && !selectedRecipeStepProduct) {
        console.error("couldn't find ingredient to add");
        break;
      }

      const selectedIngredient = selectedValidIngredient || selectedRecipeStepProduct;

      const buildNewIngredientMeasurementUnitQueries = (): string[][] => {
        const newIngredientMeasurementUnitQueries: string[][] = [...state.ingredientMeasurementUnitQueries];

        newIngredientMeasurementUnitQueries[action.stepIndex] = [
          ...(newIngredientMeasurementUnitQueries[action.stepIndex] || []),
          '',
        ];

        return newIngredientMeasurementUnitQueries;
      };

      const buildNewIngredientMeasurementUnitSuggestions = (): ValidMeasurementUnit[][][] => {
        const newIngredientMeasurementUnitSuggestions: ValidMeasurementUnit[][][] = [
          ...state.ingredientMeasurementUnitSuggestions,
        ];

        newIngredientMeasurementUnitSuggestions[action.stepIndex] = [
          ...(newIngredientMeasurementUnitSuggestions[action.stepIndex] || []),
          [],
        ];

        return newIngredientMeasurementUnitSuggestions;
      };

      const buildNewIngredientRangedStates = (): boolean[][] => {
        const newIngredientRangedStates: boolean[][] = [...state.ingredientIsRanged];

        newIngredientRangedStates[action.stepIndex] = [...(newIngredientRangedStates[action.stepIndex] || []), false];

        return newIngredientRangedStates;
      };

      const buildNewProductRangedStates = (): boolean[][] => {
        const newProductRangedStates: boolean[][] = [...state.productIsRanged];

        newProductRangedStates[action.stepIndex] = [...(newProductRangedStates[action.stepIndex] || []), false];

        return newProductRangedStates;
      };

      const buildNewIngredients = (): RecipeStepIngredient[] => {
        return [
          ...state.recipe.steps[action.stepIndex].ingredients,
          new RecipeStepIngredient({
            name: selectedIngredient!.name,
            ingredient: selectedValidIngredient?.ingredient,
            productOfRecipeStep: selectedRecipeStepProduct !== undefined,
            measurementUnit: selectedIngredient!.measurementUnit,
            minimumQuantity: selectedIngredient!.minimumQuantity,
            maximumQuantity: selectedIngredient!.maximumQuantity,
            optionIndex: 0,
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
        ingredientQueries: state.ingredientQueries.map((query: string, stepIndex: number) => {
          return stepIndex === action.stepIndex ? '' : query || '';
        }),
        ingredientSuggestions: (state.ingredientSuggestions || []).map(
          (suggestions: RecipeStepIngredient[], stepIndex: number) => {
            return stepIndex === action.stepIndex ? [] : suggestions || [];
          },
        ),
        ingredientMeasurementUnitSuggestions: buildNewIngredientMeasurementUnitSuggestions(),
        ingredientMeasurementUnitQueries: buildNewIngredientMeasurementUnitQueries(),
        ingredientMeasurementUnitQueryToExecute: {
          query: selectedValidIngredient?.ingredient!.id || '',
          stepIndex: action.stepIndex,
          secondaryIndex: state.recipe.steps[action.stepIndex].ingredients.length,
        },
        productIsRanged: buildNewProductRangedStates(),
        ingredientIsRanged: buildNewIngredientRangedStates(),
        ingredientQueryToExecute: null,
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
        ingredientMeasurementUnitQueries: state.ingredientMeasurementUnitQueries.map(
          (measurementUnitQueries: string[], stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? measurementUnitQueries.filter((_measurementUnitQuery: string, ingredientIndex: number) => {
                  return ingredientIndex !== action.recipeStepIngredientIndex;
                })
              : measurementUnitQueries;
          },
        ),
        ingredientIsRanged: state.ingredientIsRanged.map((ingredientRangedStates: boolean[], stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? ingredientRangedStates.filter((_ingredientRangedState: boolean, recipeStepIngredientIndex: number) => {
                return recipeStepIngredientIndex !== action.recipeStepIngredientIndex;
              })
            : ingredientRangedStates;
        }),
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
      const selectedInstruments = (Recipe.determinePreparedInstrumentOptions(state.recipe, action.stepIndex) || [])
        .concat(state.instrumentSuggestions[action.stepIndex] || [])
        .filter((instrumentSuggestion: RecipeStepInstrument) => {
          if (
            state.recipe.steps[action.stepIndex].instruments.find(
              (instrument: RecipeStepInstrument) =>
                instrument.instrument?.id === instrumentSuggestion.instrument?.id ||
                instrument.name === instrumentSuggestion.name,
            )
          ) {
            return false;
          }
          return (
            action.instrumentName === instrumentSuggestion.instrument?.name ||
            action.instrumentName === instrumentSuggestion.name
          );
        })
        .map((instrumentSuggestion: RecipeStepInstrument) => {
          return { ...instrumentSuggestion, minimumQuantity: 1, maximumQuantity: 1 };
        });

      if (!selectedInstruments || selectedInstruments.length === 0) {
        console.error("couldn't find instrument to add");
        break;
      }

      const buildNewInstrumentRangedStates = (): boolean[][] => {
        const newInstrumentRangedStates: boolean[][] = [...state.instrumentIsRanged];

        newInstrumentRangedStates[action.stepIndex] = [...(newInstrumentRangedStates[action.stepIndex] || []), false];

        return newInstrumentRangedStates;
      };

      newState = {
        ...state,
        instrumentIsRanged: buildNewInstrumentRangedStates(),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  instruments: [...step.instruments, ...selectedInstruments],
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
        instrumentIsRanged: state.instrumentIsRanged.map((x: boolean[], stepIndex: number) => {
          return stepIndex === action.stepIndex
            ? x.filter(
                (_isRanged: boolean, recipeStepInstrumentIndex: number) =>
                  recipeStepInstrumentIndex !== action.recipeStepInstrumentIndex,
              )
            : x;
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

    case 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS': {
      newState = {
        ...state,
        ingredientSuggestions: state.ingredientSuggestions.map(
          (ingredientSuggestionsForStepIngredientSlot: RecipeStepIngredient[], stepIndex: number) => {
            return action.stepIndex !== stepIndex ? ingredientSuggestionsForStepIngredientSlot : action.results || [];
          },
        ),
      };
      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS': {
      newState = {
        ...state,
        instrumentSuggestions: state.instrumentSuggestions.map(
          (instrumentSuggestionsForStep: RecipeStepInstrument[], stepIndex: number) => {
            return action.stepIndex !== stepIndex ? instrumentSuggestionsForStep : action.results || [];
          },
        ),
      };
      break;
    }

    case 'UPDATE_STEP_PREPARATION_QUERY': {
      newState = {
        ...state,
        preparationQueries: state.preparationQueries.map((preparationQueryForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? preparationQueryForStep : action.newQuery;
        }),
        preparationQueryToExecute: {
          stepIndex: action.stepIndex,
          query: action.newQuery,
        },
      };
      break;
    }

    case 'UPDATE_STEP_PREPARATION_QUERY_RESULTS': {
      newState = {
        ...state,
        preparationSuggestions: state.preparationSuggestions.map(
          (preparationSuggestionsForStep: ValidPreparation[], stepIndex: number) => {
            return action.stepIndex !== stepIndex ? preparationSuggestionsForStep : action.results || [];
          },
        ),
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS': {
      newState = {
        ...state,
        ingredientMeasurementUnitSuggestions: state.ingredientMeasurementUnitSuggestions.map(
          (validMeasurementUnitSuggestionsForStep: ValidMeasurementUnit[][], stepIndex: number) => {
            return validMeasurementUnitSuggestionsForStep.map(
              (
                validMeasurementUnitSuggestionsForStepIngredient: ValidMeasurementUnit[],
                recipeStepIngredientIndex: number,
              ) => {
                return stepIndex !== action.stepIndex || recipeStepIngredientIndex !== action.recipeStepIngredientIndex
                  ? validMeasurementUnitSuggestionsForStepIngredient
                  : action.results || [];
              },
            );
          },
        ),
      };
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY': {
      const buildUpdatedProductMeasurementUnitQueries = (): string[][] => {
        const updatedProductMeasurementUnitQueries = [...state.productMeasurementUnitQueries];

        if (updatedProductMeasurementUnitQueries[action.stepIndex] === undefined) {
          updatedProductMeasurementUnitQueries[action.stepIndex] = [];
        }

        updatedProductMeasurementUnitQueries[action.stepIndex][action.productIndex] = action.query;

        return updatedProductMeasurementUnitQueries;
      };

      newState = {
        ...state,
        productMeasurementUnitQueries: buildUpdatedProductMeasurementUnitQueries(),
        productMeasurementUnitQueryToExecute: {
          query: action.query,
          stepIndex: action.stepIndex,
          secondaryIndex: action.productIndex,
        },
      };
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY_RESULTS': {
      newState = {
        ...state,
        productMeasurementUnitSuggestions: state.productMeasurementUnitSuggestions.map(
          (validMeasurementUnitSuggestionsForStep: ValidMeasurementUnit[][], stepIndex: number) => {
            return validMeasurementUnitSuggestionsForStep.map(
              (
                validMeasurementUnitSuggestionsForStepIngredient: ValidMeasurementUnit[],
                recipeStepIngredientIndex: number,
              ) => {
                return stepIndex !== action.stepIndex || recipeStepIngredientIndex !== action.productIndex
                  ? validMeasurementUnitSuggestionsForStepIngredient
                  : action.results || [];
              },
            );
          },
        ),
      };
      break;
    }

    case 'ADD_COMPLETION_CONDITION_TO_STEP': {
      console.debug('Adding completion condition to step', action.stepIndex);

      newState = {
        ...state,
        completionConditionIngredientStateQueries: state.completionConditionIngredientStateQueries.map(
          (completionConditionIngredientStateQueriesForStep: string[], stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? [...completionConditionIngredientStateQueriesForStep, '']
              : completionConditionIngredientStateQueriesForStep;
          },
        ),
        completionConditionIngredientStateSuggestions: state.completionConditionIngredientStateSuggestions.map(
          (completionConditionIngredientStateSuggestionsForStep: ValidIngredientState[][], stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? [...completionConditionIngredientStateSuggestionsForStep, []]
              : completionConditionIngredientStateSuggestionsForStep;
          },
        ),
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
      const buildUpdatedCompletionConditionIngredientStateQueries = (): string[][] => {
        const updatedCompletionConditionIngredientStateQueries = [...state.completionConditionIngredientStateQueries];

        if (updatedCompletionConditionIngredientStateQueries[action.stepIndex] === undefined) {
          updatedCompletionConditionIngredientStateQueries[action.stepIndex] = [];
        }

        updatedCompletionConditionIngredientStateQueries[action.stepIndex][action.conditionIndex] = action.query;

        return updatedCompletionConditionIngredientStateQueries;
      };

      newState = {
        ...state,
        completionConditionIngredientStateQueries: buildUpdatedCompletionConditionIngredientStateQueries(),
        completionConditionIngredientStateQueryToExecute: {
          query: action.query,
          stepIndex: action.stepIndex,
          secondaryIndex: action.conditionIndex,
        },
      };
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY_RESULTS': {
      newState = {
        ...state,
        completionConditionIngredientStateSuggestions: state.completionConditionIngredientStateSuggestions.map(
          (completionConditionIngredientStateSuggestionsForStep: ValidIngredientState[][], stepIndex: number) => {
            return completionConditionIngredientStateSuggestionsForStep.map(
              (
                completionConditionIngredientStateSuggestionsForStepCondition: ValidIngredientState[],
                conditionIndex: number,
              ) => {
                return stepIndex !== action.stepIndex || conditionIndex !== action.conditionIndex
                  ? completionConditionIngredientStateSuggestionsForStepCondition
                  : action.results || [];
              },
            );
          },
        ),
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
        completionConditionIngredientStateQueries: state.completionConditionIngredientStateQueries.map(
          (completionConditionIngredientStateQueriesForStep: string[], stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? completionConditionIngredientStateQueriesForStep.filter(
                  (_: string, conditionIndex: number) => conditionIndex !== action.conditionIndex,
                )
              : completionConditionIngredientStateQueriesForStep;
          },
        ),
        completionConditionIngredientStateSuggestions: state.completionConditionIngredientStateSuggestions.map(
          (completionConditionIngredientStateSuggestionsForStep: ValidIngredientState[][], stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? completionConditionIngredientStateSuggestionsForStep.filter(
                  (_: ValidIngredientState[], conditionIndex: number) => conditionIndex !== action.conditionIndex,
                )
              : completionConditionIngredientStateSuggestionsForStep;
          },
        ),
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
      const selectedPreparation = (state.preparationSuggestions[action.stepIndex] || []).find(
        (preparationSuggestion: ValidPreparation) => preparationSuggestion.name === action.preparationName,
      );

      if (!selectedPreparation) {
        console.error(
          `couldn't find preparation to add: ${action.preparationName}, ${JSON.stringify(
            state.preparationSuggestions[action.stepIndex].map((x) => x.name),
          )}`,
        );
        break;
      }

      // we need to effectively reset the step, since the preparation is the root.
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  preparation: selectedPreparation,
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
        instrumentSuggestions: state.instrumentSuggestions.map(
          (instrumentSuggestionsForStep: RecipeStepInstrument[], stepIndex: number) => {
            return stepIndex !== action.stepIndex ? instrumentSuggestionsForStep : [];
          },
        ),
        instrumentQueryToExecute: {
          stepIndex: action.stepIndex,
          query: selectedPreparation.id,
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
            return index !== action.stepIndex ? step : { ...step, notes: action.newDescription };
          }),
        },
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_QUERY': {
      newState = {
        ...state,
        ingredientQueries: state.ingredientQueries.map((ingredientQueriesForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? ingredientQueriesForStep : action.newQuery;
        }),
        ingredientQueryToExecute: {
          query: action.newQuery,
          stepIndex: action.stepIndex,
        },
      };
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY': {
      const buildUpdatedIngredientMeasurementUnitQueries = (): string[][] => {
        const updatedIngredientMeasurementUnitQueries = [...state.ingredientMeasurementUnitQueries];

        if (updatedIngredientMeasurementUnitQueries[action.stepIndex] === undefined) {
          updatedIngredientMeasurementUnitQueries[action.stepIndex] = [];
        }

        updatedIngredientMeasurementUnitQueries[action.stepIndex][action.recipeStepIngredientIndex] = action.newQuery;

        return updatedIngredientMeasurementUnitQueries;
      };

      newState = {
        ...state,
        ingredientMeasurementUnitQueries: buildUpdatedIngredientMeasurementUnitQueries(),
        ingredientMeasurementUnitQueryToExecute: {
          query: action.newQuery,
          stepIndex: action.stepIndex,
          secondaryIndex: action.recipeStepIngredientIndex,
        },
      };
      break;
    }

    case 'TOGGLE_INGREDIENT_RANGE': {
      newState = {
        ...state,
        ingredientIsRanged: state.ingredientIsRanged.map(
          (stepIngredientRangedDetails: boolean[], stepIndex: number) => {
            return stepIngredientRangedDetails.map((ingredientIsRanged: boolean, ingredientIndex: number) => {
              return stepIndex === action.stepIndex && ingredientIndex === action.recipeStepIngredientIndex
                ? !ingredientIsRanged
                : ingredientIsRanged;
            });
          },
        ),
      };
      break;
    }

    case 'TOGGLE_INSTRUMENT_RANGE': {
      newState = {
        ...state,
        instrumentIsRanged: state.instrumentIsRanged.map(
          (stepInstrumentRangedDetails: boolean[], stepIndex: number) => {
            return stepInstrumentRangedDetails.map((instrumentIsRanged: boolean, instrumentIndex: number) => {
              return stepIndex === action.stepIndex && instrumentIndex === action.recipeStepInstrumentIndex
                ? !instrumentIsRanged
                : instrumentIsRanged;
            });
          },
        ),
      };
      break;
    }

    case 'TOGGLE_PRODUCT_RANGE': {
      newState = {
        ...state,
        productIsRanged: state.productIsRanged.map((stepInstrumentRangedDetails: boolean[], stepIndex: number) => {
          return stepInstrumentRangedDetails.map((productIsRanged: boolean, productIndex: number) => {
            return stepIndex === action.stepIndex && productIndex === action.productIndex
              ? !productIsRanged
              : productIsRanged;
          });
        }),
      };
      break;
    }

    case 'TOGGLE_MANUAL_PRODUCT_NAMING': {
      const ingredientList = new Intl.ListFormat('en').format(
        state.recipe.steps[action.stepIndex].ingredients.map((x: RecipeStepIngredient) => x.ingredient?.name || x.name),
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
        productsNamedManually: state.productsNamedManually.map(
          (stepProductNamedManuallyDetails: boolean[], stepIndex: number) => {
            return stepProductNamedManuallyDetails.map((productNamedManually: boolean, productIndex: number) => {
              return stepIndex === action.stepIndex && productIndex === action.productIndex
                ? !productNamedManually
                : productNamedManually;
            });
          },
        ),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex !== action.stepIndex ? step : { ...step, products: buildNewRecipeStepProducts() };
          }),
        },
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
