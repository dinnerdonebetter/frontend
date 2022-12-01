import { Reducer } from 'react';

import {
  ValidMeasurementUnit,
  ValidIngredient,
  ValidPreparationInstrument,
  ValidPreparation,
  Recipe,
  RecipeStep,
  RecipeStepProduct,
  RecipeStepIngredient,
  RecipeStepInstrument,
} from '@prixfixeco/models';

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
  | { type: 'TOGGLE_SHOW_ALL_INGREDIENTS' }
  | { type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' }
  | { type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' }
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'UPDATE_NAME'; newName: string }
  | { type: 'UPDATE_DESCRIPTION'; newDescription: string }
  | { type: 'UPDATE_SOURCE'; newSource: string }
  | { type: 'UPDATE_YIELDS_PORTIONS'; newPortions?: number }
  | { type: 'ADD_STEP' }
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
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT';
      stepIndex: number;
      productIndex: number;
      measurementUnit?: ValidMeasurementUnit;
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
      results: ValidPreparationInstrument[];
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

  recipe: Recipe = new Recipe({
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
  instrumentSuggestions: ValidPreparationInstrument[][] = [[]];

  productsNamedManually: boolean[][] = [[true]];
}

export const useMealCreationReducer: Reducer<RecipeCreationPageState, RecipeCreationAction> = (
  state: RecipeCreationPageState,
  action: RecipeCreationAction,
): RecipeCreationPageState => {
  if (debugTypes.has(action.type)) {
    console.debug(`[useMealCreationReducer] action: ${JSON.stringify(action)}`);
  }

  let newState: RecipeCreationPageState = { ...state };

  switch (action.type) {
    case 'TOGGLE_SHOW_ALL_INGREDIENTS': {
      newState.showIngredientsSummary = !state.showIngredientsSummary;
      break;
    }

    case 'TOGGLE_SHOW_ALL_INSTRUMENTS': {
      newState.showInstrumentsSummary = !state.showInstrumentsSummary;
      break;
    }

    case 'TOGGLE_SHOW_ADVANCED_PREP_STEPS': {
      newState.showAdvancedPrepStepInputs = !state.showAdvancedPrepStepInputs;
      break;
    }

    case 'UPDATE_SUBMISSION_ERROR': {
      newState.submissionError = action.error;
      break;
    }

    case 'UPDATE_NAME': {
      newState.recipe.name = action.newName;
      newState.submissionShouldBePrevented = recipeSubmissionShouldBeDisabled(state);
      break;
    }

    case 'UPDATE_DESCRIPTION': {
      newState.recipe.description = action.newDescription;
      break;
    }

    case 'UPDATE_SOURCE': {
      newState.recipe.source = action.newSource;
      break;
    }

    case 'UPDATE_YIELDS_PORTIONS': {
      if (action.newPortions) {
        newState.recipe.yieldsPortions = action.newPortions;
      }
      break;
    }

    case 'ADD_STEP': {
      newState.ingredientQueries = [...state.ingredientQueries, ''];
      newState.ingredientSuggestions = [
        ...state.ingredientSuggestions,
        ...state.recipe.steps.map(
          (x: RecipeStep) => x.products.map((y: RecipeStepProduct) => new RecipeStepIngredient({ name: y.name })), // TODO: FIXME
        ),
      ];
      newState.preparationQueries = [...state.preparationQueries, ''];
      newState.preparationSuggestions = [...state.preparationSuggestions, []];
      newState.instrumentSuggestions = [...state.instrumentSuggestions, []];
      newState.productsNamedManually = [...state.productsNamedManually, [true]];
      newState.productMeasurementUnitQueries = [...state.productMeasurementUnitQueries, ['']];
      newState.productMeasurementUnitSuggestions = [...state.productMeasurementUnitSuggestions, [[]]];
      newState.productIsRanged = [...state.productIsRanged, [false]];

      newState.recipe.steps.push(
        new RecipeStep({
          media: [],
          instruments: [],
          ingredients: [],
          products: [new RecipeStepProduct()],
        }),
      );

      break;
    }

    case 'REMOVE_STEP': {
      newState.recipe.steps = state.recipe.steps.filter(
        (_step: RecipeStep, index: number) => index !== action.stepIndex,
      );
      break;
    }

    case 'ADD_INGREDIENT_TO_STEP': {
      const selectedIngredient = (state.ingredientSuggestions[action.stepIndex] || []).find(
        (ingredientSuggestion: RecipeStepIngredient) => ingredientSuggestion.ingredient?.name === action.ingredientName,
      );

      if (!selectedIngredient) {
        console.error("couldn't find ingredient to add");
        break;
      }

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
            name: selectedIngredient.name,
            ingredient: selectedIngredient.ingredient,
            productOfRecipeStep: false,
            minimumQuantity: 1,
            maximumQuantity: 1,
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

      newState.ingredientQueries = state.ingredientQueries.map((query: string, stepIndex: number) => {
        return stepIndex === action.stepIndex ? '' : query || '';
      });
      newState.ingredientSuggestions = (state.ingredientSuggestions || []).map(
        (suggestions: RecipeStepIngredient[], stepIndex: number) => {
          return stepIndex === action.stepIndex ? [] : suggestions || [];
        },
      );
      newState.ingredientMeasurementUnitSuggestions = buildNewIngredientMeasurementUnitSuggestions();
      newState.ingredientMeasurementUnitQueries = buildNewIngredientMeasurementUnitQueries();
      newState.ingredientMeasurementUnitQueryToExecute = {
        query: selectedIngredient.ingredient?.name || '',
        stepIndex: action.stepIndex,
        secondaryIndex: state.recipe.steps[action.stepIndex].ingredients.length,
      };
      newState.productIsRanged = buildNewProductRangedStates();
      newState.ingredientIsRanged = buildNewIngredientRangedStates();
      newState.ingredientQueryToExecute = null;

      newState.recipe = {
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
      };

      break;
    }

    case 'REMOVE_INGREDIENT_FROM_STEP': {
      newState.ingredientMeasurementUnitQueries[action.stepIndex] = state.ingredientMeasurementUnitQueries[
        action.stepIndex
      ].filter((_measurementUnitQuery: string, ingredientIndex: number) => {
        return ingredientIndex !== action.recipeStepIngredientIndex;
      });
      newState.ingredientIsRanged[action.stepIndex] = state.ingredientIsRanged[action.stepIndex].filter(
        (_isRanged: boolean, ingredientIndex: number) => {
          return ingredientIndex !== action.recipeStepIngredientIndex;
        },
      );
      newState.recipe.steps[action.stepIndex].ingredients = state.recipe.steps[action.stepIndex].ingredients.filter(
        (_ingredient: RecipeStepIngredient, recipeStepIngredientIndex: number) =>
          recipeStepIngredientIndex !== action.recipeStepIngredientIndex,
      );

      break;
    }

    case 'ADD_INSTRUMENT_TO_STEP': {
      const selectedInstruments = (state.instrumentSuggestions[action.stepIndex] || []).filter(
        (instrumentSuggestion: ValidPreparationInstrument) => {
          if (
            state.recipe.steps[action.stepIndex].instruments.find(
              (instrument: RecipeStepInstrument) => instrument.instrument?.id === instrumentSuggestion.instrument?.id,
            )
          ) {
            return false;
          }
          return action.instrumentName === instrumentSuggestion.instrument.name;
        },
      );

      if (!selectedInstruments) {
        console.error("couldn't find instrument to add");
        break;
      }

      const buildNewInstrumentRangedStates = (): boolean[][] => {
        const newInstrumentRangedStates: boolean[][] = [...state.instrumentIsRanged];

        newInstrumentRangedStates[action.stepIndex] = [...(newInstrumentRangedStates[action.stepIndex] || []), false];

        return newInstrumentRangedStates;
      };

      newState.instrumentIsRanged = buildNewInstrumentRangedStates();
      newState.recipe.steps[action.stepIndex].instruments = [
        ...newState.recipe.steps[action.stepIndex].instruments,
        ...selectedInstruments.map(
          (x: ValidPreparationInstrument) =>
            new RecipeStepInstrument({
              name: x.instrument.name,
              instrument: x.instrument,
              productOfRecipeStep: false,
              minimumQuantity: 1,
              maximumQuantity: 1,
              optionIndex: 0,
            }),
        ),
      ];
      break;
    }

    case 'REMOVE_INSTRUMENT_FROM_STEP': {
      newState.ingredientIsRanged[action.stepIndex] = (newState.ingredientIsRanged[action.stepIndex] || []).filter(
        (_isRanged: boolean, recipeStepInstrumentIndex: number) =>
          recipeStepInstrumentIndex !== action.recipeStepInstrumentIndex,
      );

      newState.recipe.steps[action.stepIndex].instruments = (
        newState.recipe.steps[action.stepIndex].instruments || []
      ).filter(
        (_instrument: RecipeStepInstrument, instrumentIndex: number) =>
          instrumentIndex !== action.recipeStepInstrumentIndex,
      );
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS': {
      newState.ingredientSuggestions[action.stepIndex] = action.results || [];
      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS': {
      newState.instrumentSuggestions[action.stepIndex] = action.results || [];
      break;
    }

    case 'UPDATE_STEP_PREPARATION_QUERY': {
      newState.preparationQueries[action.stepIndex] = action.newQuery;

      if (action.newQuery === '') {
        newState.preparationSuggestions[action.stepIndex] = [];
      }

      newState.preparationQueryToExecute = {
        stepIndex: action.stepIndex,
        query: action.newQuery,
      };
      break;
    }

    case 'UPDATE_STEP_PREPARATION_QUERY_RESULTS': {
      newState.preparationSuggestions[action.stepIndex] = action.results || [];
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS': {
      newState.ingredientMeasurementUnitSuggestions[action.stepIndex][action.recipeStepIngredientIndex] =
        action.results || [];
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY_RESULTS': {
      newState.productMeasurementUnitSuggestions[action.stepIndex][action.productIndex] = action.results || [];
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT': {
      if (!action.measurementUnit) {
        console.error("couldn't find measurement unit to add");
        break;
      }

      newState.recipe.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].measurementUnit =
        action.measurementUnit;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT': {
      if (!action.measurementUnit) {
        console.error("couldn't find measurement unit to add");
        break;
      }

      newState.recipe.steps[action.stepIndex].products[action.productIndex].measurementUnit = action.measurementUnit;
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY': {
      newState.recipe.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].minimumQuantity =
        action.newAmount;
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY': {
      newState.recipe.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].maximumQuantity =
        action.newAmount;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY': {
      newState.recipe.steps[action.stepIndex].products[action.productIndex].minimumQuantity = action.newAmount;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY': {
      newState.recipe.steps[action.stepIndex].products[action.productIndex].maximumQuantity = action.newAmount;
      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY': {
      newState.recipe.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].minimumQuantity =
        action.newAmount;
      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY': {
      newState.recipe.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].maximumQuantity =
        action.newAmount;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_NAME': {
      newState.recipe.steps[action.stepIndex].products[action.productIndex].name = action.newName;
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

      newState.recipe.steps[action.stepIndex].preparation = selectedPreparation;
      newState.instrumentSuggestions[action.stepIndex] = [];
      newState.instrumentQueryToExecute = {
        stepIndex: action.stepIndex,
        query: selectedPreparation.id,
      };

      break;
    }

    case 'UPDATE_STEP_NOTES': {
      newState.recipe.steps[action.stepIndex].notes = action.newDescription;
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_QUERY': {
      newState.ingredientQueries = state.ingredientQueries.map(
        (ingredientQueriesForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? ingredientQueriesForStep : action.newQuery;
        },
      );

      if (action.newQuery.trim() === '') {
        newState.ingredientSuggestions[action.stepIndex] = [];
      }

      newState.ingredientQueryToExecute = {
        query: action.newQuery,
        stepIndex: action.stepIndex,
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

      if (action.newQuery.trim() === '') {
        newState.ingredientMeasurementUnitSuggestions[action.stepIndex] = [];
      }

      newState.ingredientMeasurementUnitQueries = buildUpdatedIngredientMeasurementUnitQueries();
      newState.ingredientMeasurementUnitQueryToExecute = {
        query: action.newQuery,
        stepIndex: action.stepIndex,
        secondaryIndex: action.recipeStepIngredientIndex,
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

      if (action.query.trim() === '') {
        newState.productMeasurementUnitSuggestions[action.stepIndex] = [];
      }

      newState.productMeasurementUnitQueries = buildUpdatedProductMeasurementUnitQueries();
      newState.productMeasurementUnitQueryToExecute = {
        query: action.query,
        stepIndex: action.stepIndex,
        secondaryIndex: action.productIndex,
      };
      break;
    }

    case 'TOGGLE_INGREDIENT_RANGE': {
      newState.ingredientIsRanged = state.ingredientIsRanged.map(
        (stepIngredientRangedDetails: boolean[], stepIndex: number) => {
          return stepIngredientRangedDetails.map((ingredientIsRanged: boolean, ingredientIndex: number) => {
            return stepIndex === action.stepIndex && ingredientIndex === action.recipeStepIngredientIndex
              ? !ingredientIsRanged
              : ingredientIsRanged;
          });
        },
      );
      break;
    }

    case 'TOGGLE_INSTRUMENT_RANGE': {
      newState.instrumentIsRanged = state.instrumentIsRanged.map(
        (stepInstrumentRangedDetails: boolean[], stepIndex: number) => {
          return stepInstrumentRangedDetails.map((instrumentIsRanged: boolean, instrumentIndex: number) => {
            return stepIndex === action.stepIndex && instrumentIndex === action.recipeStepInstrumentIndex
              ? !instrumentIsRanged
              : instrumentIsRanged;
          });
        },
      );
      break;
    }

    case 'TOGGLE_PRODUCT_RANGE': {
      newState.productIsRanged = state.productIsRanged.map(
        (stepInstrumentRangedDetails: boolean[], stepIndex: number) => {
          return stepInstrumentRangedDetails.map((productIsRanged: boolean, productIndex: number) => {
            return stepIndex === action.stepIndex && productIndex === action.productIndex
              ? !productIsRanged
              : productIsRanged;
          });
        },
      );
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

      newState.productsNamedManually = state.productsNamedManually.map(
        (stepProductNamedManuallyDetails: boolean[], stepIndex: number) => {
          return stepProductNamedManuallyDetails.map((productNamedManually: boolean, productIndex: number) => {
            return stepIndex === action.stepIndex && productIndex === action.productIndex
              ? !productNamedManually
              : productNamedManually;
          });
        },
      );
      newState.recipe.steps[action.stepIndex].products = buildNewRecipeStepProducts();

      break;
    }

    default:
      console.error(`Unhandled action type`);
  }

  if (debugTypes.has(action.type)) {
    console.debug(`[useMealCreationReducer] returned state: ${JSON.stringify(newState)}`);
  }

  return newState;
};
