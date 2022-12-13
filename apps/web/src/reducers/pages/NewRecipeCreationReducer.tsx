import { Reducer } from 'react';
import { immerable, produce } from 'immer';

import {
  IRecipeCreationRequestInput,
  IRecipeStep,
  IRecipeStepCompletionCondition,
  IRecipeStepIngredient,
  IRecipeStepInstrument,
  IRecipeStepProduct,
  IValidIngredientState,
  IValidMeasurementUnit,
  IValidPreparation,
  IValidPreparationInstrument,
  RecipeCreationRequestInput,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  ValidMeasurementUnit,
} from '@prixfixeco/models';

const determinePreparedInstrumentOptions = (
  recipeSteps: NewRecipeStepCreationPageState[],
  stepIndex: number,
): Array<IRecipeStepInstrument> => {
  var availableInstruments: Record<string, IRecipeStepProduct> = {};

  for (let i = 0; i < stepIndex; i++) {
    const step = recipeSteps[i];

    // add all recipe step product instruments to the record
    step.products.forEach((product: IRecipeStepProduct) => {
      if (product.type === 'instrument') {
        availableInstruments[product.name] = product;
      }
    });

    // remove recipe step product instruments that are used in subsequent steps
    step.instruments.forEach((instrument: IRecipeStepInstrument) => {
      if (instrument.productOfRecipeStep) {
        delete availableInstruments[instrument.name];
      }
    });
  }

  // convert the product creation requests to recipe step products
  const suggestions: IRecipeStepInstrument[] = [];
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

const determineAvailableRecipeStepProducts = (
  recipeSteps: NewRecipeStepCreationPageState[],
  upToStep: number,
): Array<IRecipeStepIngredient> => {
  // first we need to determine the available products thusfar
  var availableProducts: Record<string, IRecipeStepProduct> = {};

  for (let i = 0; i < upToStep; i++) {
    const step = recipeSteps[i];

    // add all recipe step products to the record
    step.products.forEach((product: IRecipeStepProduct) => {
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

const debugTypes = new Set(['']);

interface queryUpdateData {
  query: string;
  stepIndex: number;
  secondaryIndex?: number;
}

export class NewRecipeCreationPageState {
  [immerable] = true;

  // recipe stuff
  name: string = '';
  source: string = '';
  description: string = '';
  alsoCreateMeal: boolean = false;
  yieldsPortions: number = 1;
  steps: NewRecipeStepCreationPageState[] = [new NewRecipeStepCreationPageState()];

  ingredientMeasurementUnitQueryToExecute: queryUpdateData | null = null;
  productMeasurementUnitQueryToExecute: queryUpdateData | null = null;
  completionConditionIngredientStateQueryToExecute: queryUpdateData | null = null;
  preparationQueryToExecute: queryUpdateData | null = null;
  ingredientQueryToExecute: queryUpdateData | null = null;
  instrumentQueryToExecute: queryUpdateData | null = null;

  // meta stuff
  showIngredientsSummary: boolean = false;
  showInstrumentsSummary: boolean = false;
  showAdvancedPrepStepInputs: boolean = false;

  toRecipeStepCreationInput(): RecipeCreationRequestInput {
    return new RecipeCreationRequestInput({
      name: this.name,
    });
  }
}

export class NewRecipeStepCreationPageState {
  [immerable] = true;

  // inputs we need
  minimumTemperatureInCelsius?: number;
  maximumTemperatureInCelsius?: number;
  notes: string = '';
  index: number = -1;
  minimumEstimatedTimeInSeconds?: number;
  maximumEstimatedTimeInSeconds?: number;
  optional: boolean = false;
  explicitInstructions: string = '';

  ingredients: IRecipeStepIngredient[] = [];
  instruments: IRecipeStepInstrument[] = [];
  products: IRecipeStepProduct[] = [
    new RecipeStepProduct({
      minimumQuantity: 1,
      maximumQuantity: 0,
      type: 'ingredient',
    }),
  ];
  completionConditions: IRecipeStepCompletionCondition[] = [];

  // meta stuff for the page
  show: boolean = true;
  data: IRecipeStep = {} as IRecipeStep;
  preparation: IValidPreparation | null = null;

  instrumentIsRanged: boolean[] = [false];
  ingredientIsRanged: boolean[] = [false];
  productIsRanged: boolean[] = [false];

  // ingredient measurement units
  ingredientMeasurementUnitQueries: string[] = [];
  ingredientMeasurementUnitSuggestions: IValidMeasurementUnit[][] = [[]];

  // product measurement units
  productMeasurementUnitQueries: string[] = [''];
  productMeasurementUnitSuggestions: IValidMeasurementUnit[][] = [[]];

  // completion condition ingredient states
  completionConditionIngredientStateQueries: string[] = [''];
  completionConditionIngredientStateSuggestions: IValidIngredientState[][] = [[]];

  // preparations
  preparationQuery: string = '';
  preparationSuggestions: IValidPreparation[] = [];

  // ingredients
  ingredientQuery: string = '';
  ingredientSuggestions: IRecipeStepIngredient[] = [];

  // instruments
  instrumentSuggestions: IRecipeStepInstrument[] = [];

  productsNamedManually: boolean[] = [true];
}

type recipeCreationReducer = Reducer<NewRecipeCreationPageState, NewRecipeCreationAction>;

type NewRecipeCreationAction =
  | { type: 'UNKNOWN' }
  | { type: 'SET_RECIPE_NAME'; content: string }
  | { type: 'SET_RECIPE_PORTION_YIELD'; portions: number }
  | { type: 'SET_RECIPE_DESCRIPTION'; content: string }
  | { type: 'SET_RECIPE_SOURCE'; content: string }
  | { type: 'ADD_STEP' }
  | { type: 'SET_RECIPE_STEP_NOTES'; stepIndex: number; content: string }
  | { type: 'SET_RECIPE_STEP_PREPARATION_QUERY'; stepIndex: number; content: string }
  | { type: 'SET_RECIPE_STEP_PREPARATION_RESULTS'; stepIndex: number; results: IValidPreparation[] }
  | { type: 'SET_RECIPE_STEP_PREPARATION'; stepIndex: number; result: IValidPreparation }
  | { type: 'CLEAR_RECIPE_STEP_PREPARATION'; stepIndex: number }
  | { type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS'; stepIndex: number; results: IRecipeStepInstrument[] }
  | {
      type: 'ADD_INGREDIENT_TO_STEP';
      stepIndex: number;
      ingredientName: string;
    }
  | {
      type: 'ADD_INSTRUMENT_TO_STEP';
      stepIndex: number;
      instrumentName: string;
    }
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY'; stepIndex: number; content: string }
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS'; stepIndex: number; results: IRecipeStepIngredient[] }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      content: string;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      results: IValidMeasurementUnit[];
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
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY';
      stepIndex: number;
      productIndex: number;
      content: string;
    }
  | {
      type: 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY_RESULTS';
      stepIndex: number;
      productIndex: number;
      results: IValidMeasurementUnit[];
    }
  | {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY';
      stepIndex: number;
      conditionIndex: number;
      content: string;
    }
  | {
      type: 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY_RESULTS';
      stepIndex: number;
      conditionIndex: number;
      results: IValidIngredientState[];
    }
  | { type: 'TOGGLE_SHOW_STEP'; stepIndex: number }
  | { type: 'TOGGLE_INSTRUMENT_RANGE'; stepIndex: number; recipeStepInstrumentIndex: number }
  | { type: 'TOGGLE_INGREDIENT_RANGE'; stepIndex: number; recipeStepIngredientIndex: number }
  | { type: 'TOGGLE_PRODUCT_RANGE'; stepIndex: number; productIndex: number }
  | { type: 'TOGGLE_MANUAL_PRODUCT_NAMING'; stepIndex: number; productIndex: number }
  | { type: 'TOGGLE_SHOW_ALL_INGREDIENTS' }
  | { type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' }
  | { type: 'TOGGLE_SHOW_ADVANCED_PREP_STEPS' };

export const useNewRecipeCreationReducer: recipeCreationReducer = (
  original: NewRecipeCreationPageState,
  action: NewRecipeCreationAction,
) =>
  produce(original, (state: NewRecipeCreationPageState) => {
    console.log(`handling event: ${action.type}`);

    switch (action.type) {
      // miscellaneous page state things

      case 'TOGGLE_SHOW_STEP': {
        state.steps[action.stepIndex].show = !state.steps[action.stepIndex].show;
        break;
      }

      case 'TOGGLE_INSTRUMENT_RANGE': {
        state.steps[action.stepIndex].instrumentIsRanged[action.recipeStepInstrumentIndex] =
          !state.steps[action.stepIndex].instrumentIsRanged[action.recipeStepInstrumentIndex];
        break;
      }

      case 'TOGGLE_INGREDIENT_RANGE': {
        state.steps[action.stepIndex].ingredientIsRanged[action.recipeStepIngredientIndex] =
          !state.steps[action.stepIndex].ingredientIsRanged[action.recipeStepIngredientIndex];
        state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].maximumQuantity = Math.max(
          state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].maximumQuantity,
          state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].minimumQuantity,
        );
        break;
      }

      case 'TOGGLE_PRODUCT_RANGE': {
        state.steps[action.stepIndex].productIsRanged[action.productIndex] =
          !state.steps[action.stepIndex].productIsRanged[action.productIndex];
        break;
      }

      case 'TOGGLE_MANUAL_PRODUCT_NAMING': {
        state.steps[action.stepIndex].productsNamedManually[action.productIndex] =
          !state.steps[action.stepIndex].productsNamedManually[action.productIndex];
        break;
      }

      case 'TOGGLE_SHOW_ALL_INGREDIENTS': {
        state.showIngredientsSummary = !state.showIngredientsSummary;
        break;
      }

      case 'TOGGLE_SHOW_ALL_INSTRUMENTS': {
        state.showInstrumentsSummary = !state.showInstrumentsSummary;
        break;
      }

      case 'TOGGLE_SHOW_ADVANCED_PREP_STEPS': {
        state.showAdvancedPrepStepInputs = !state.showAdvancedPrepStepInputs;
        break;
      }

      // recipe-oriented stuff
      case 'SET_RECIPE_NAME': {
        state.name = action.content;
        break;
      }

      case 'SET_RECIPE_PORTION_YIELD': {
        state.yieldsPortions = action.portions;
        break;
      }

      case 'SET_RECIPE_DESCRIPTION': {
        state.description = action.content;
        break;
      }

      case 'SET_RECIPE_SOURCE': {
        state.source = action.content;
        break;
      }

      case 'ADD_STEP': {
        state.steps.push(new NewRecipeStepCreationPageState());
        break;
      }

      case 'SET_RECIPE_STEP_PREPARATION_QUERY': {
        state.steps[action.stepIndex].preparationQuery = action.content;
        state.preparationQueryToExecute = {
          query: action.content,
          stepIndex: action.stepIndex,
        };
        break;
      }

      case 'SET_RECIPE_STEP_PREPARATION_RESULTS': {
        state.steps[action.stepIndex].preparationSuggestions = action.results;
        break;
      }

      case 'SET_RECIPE_STEP_PREPARATION': {
        state.steps[action.stepIndex].preparationQuery = action.result.name;
        state.preparationQueryToExecute = null;
        state.steps[action.stepIndex].preparation = action.result;
        state.instrumentQueryToExecute = {
          query: action.result.id,
          stepIndex: action.stepIndex,
        };
        break;
      }

      case 'CLEAR_RECIPE_STEP_PREPARATION': {
        state.steps[action.stepIndex].preparationQuery = '';
        state.preparationQueryToExecute = null;
        state.steps[action.stepIndex].preparation = null;
        state.steps[action.stepIndex].preparationSuggestions = [];
        break;
      }

      case 'SET_RECIPE_STEP_NOTES': {
        state.steps[action.stepIndex].notes = action.content;
        break;
      }

      case 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS': {
        state.steps[action.stepIndex].instrumentSuggestions = action.results;
        break;
      }

      case 'ADD_INSTRUMENT_TO_STEP': {
        const step = state.steps[action.stepIndex];
        const selectedInstruments = (determinePreparedInstrumentOptions(state.steps, action.stepIndex) || [])
          .concat(step.instrumentSuggestions || [])
          .filter((instrumentSuggestion: RecipeStepInstrument) => {
            if (
              step.instruments.find(
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
          return;
        }

        state.steps[action.stepIndex].instruments =
          state.steps[action.stepIndex].instruments.concat(selectedInstruments);
        state.steps[action.stepIndex].instrumentIsRanged.push(false);

        break;
      }

      case 'UPDATE_STEP_INSTRUMENT_MINIMUM_QUANTITY': {
        state.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].minimumQuantity = Math.max(
          action.newAmount,
          1,
        );
        state.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].maximumQuantity = Math.max(
          Math.max(action.newAmount, 1),
          state.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].maximumQuantity,
        );
        break;
      }

      case 'UPDATE_STEP_INSTRUMENT_MAXIMUM_QUANTITY': {
        state.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].minimumQuantity = Math.max(
          state.steps[action.stepIndex].instruments[action.recipeStepInstrumentIndex].minimumQuantity,
          action.newAmount,
        );
        break;
      }

      case 'UPDATE_STEP_INGREDIENT_MINIMUM_QUANTITY': {
        state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].minimumQuantity = Math.max(
          action.newAmount,
          1,
        );
        state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].maximumQuantity = Math.max(
          Math.max(action.newAmount, 1),
          state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].maximumQuantity,
        );
        break;
      }

      case 'UPDATE_STEP_INGREDIENT_MAXIMUM_QUANTITY': {
        state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].maximumQuantity = Math.max(
          state.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].minimumQuantity,
          action.newAmount,
        );
        break;
      }

      case 'UPDATE_STEP_PRODUCT_MINIMUM_QUANTITY': {
        state.steps[action.stepIndex].products[action.productIndex].minimumQuantity = Math.max(action.newAmount, 1);
        state.steps[action.stepIndex].products[action.productIndex].maximumQuantity = Math.max(
          Math.max(action.newAmount, 1),
          state.steps[action.stepIndex].products[action.productIndex].maximumQuantity,
        );
        break;
      }

      case 'UPDATE_STEP_PRODUCT_MAXIMUM_QUANTITY': {
        state.steps[action.stepIndex].products[action.productIndex].minimumQuantity = Math.max(
          state.steps[action.stepIndex].products[action.productIndex].minimumQuantity,
          action.newAmount,
        );
        break;
      }

      case 'UPDATE_STEP_INGREDIENT_QUERY': {
        state.steps[action.stepIndex].ingredientQuery = action.content;
        state.ingredientQueryToExecute = {
          query: action.content,
          stepIndex: action.stepIndex,
        };
        break;
      }

      case 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS': {
        state.steps[action.stepIndex].ingredientSuggestions = action.results;
        break;
      }

      case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY': {
        state.steps[action.stepIndex].productMeasurementUnitQueries[action.recipeStepIngredientIndex] = action.content;
        state.ingredientQueryToExecute = {
          query: action.content,
          stepIndex: action.stepIndex,
        };
        break;
      }

      case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS': {
        state.steps[action.stepIndex].productMeasurementUnitSuggestions[action.recipeStepIngredientIndex] =
          action.results;
        break;
      }

      case 'ADD_INGREDIENT_TO_STEP': {
        const selectedValidIngredient = (state.steps[action.stepIndex].ingredientSuggestions || []).find(
          (ingredientSuggestion: RecipeStepIngredient) =>
            ingredientSuggestion.ingredient?.name === action.ingredientName,
        );

        const selectedRecipeStepProduct = (
          determineAvailableRecipeStepProducts(state.steps, action.stepIndex) || []
        ).find((recipeStepProduct: RecipeStepIngredient) => recipeStepProduct.name === action.ingredientName);

        const selectedIngredient = selectedValidIngredient || selectedRecipeStepProduct;

        if (!selectedIngredient) {
          console.error("couldn't find ingredient to add");
          break;
        }

        state.steps[action.stepIndex].ingredientQuery = '';
        state.ingredientQueryToExecute = null;
        state.steps[action.stepIndex].ingredientSuggestions = [];
        state.steps[action.stepIndex].ingredients.push(
          new RecipeStepIngredient({
            name: selectedIngredient!.name,
            ingredient: selectedValidIngredient?.ingredient,
            measurementUnit: selectedIngredient!.measurementUnit,
            minimumQuantity: selectedIngredient!.minimumQuantity,
            maximumQuantity: selectedIngredient!.maximumQuantity,
            // productOfRecipeStepIndex: 0,
            // productOfRecipeStepProductIndex: 0,
          }),
        );

        break;
      }

      default:
        console.log(`unhandled action type: ${action.type}`);
        break;
    }
  });
