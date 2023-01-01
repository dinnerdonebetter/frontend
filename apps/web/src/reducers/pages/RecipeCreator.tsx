import { Reducer } from 'react';

import {
  ValidMeasurementUnit,
  ValidPreparation,
  RecipeStepIngredient,
  RecipeStepInstrument,
  ValidIngredientState,
  RecipeCreationRequestInput,
  RecipeStepCreationRequestInput,
  RecipeStepProductCreationRequestInput,
  RecipeStepIngredientCreationRequestInput,
  RecipeStepCompletionConditionCreationRequestInput,
  RecipeStepInstrumentCreationRequestInput,
  ValidRecipeStepProductType,
} from '@prixfixeco/models';
import { determineAvailableRecipeStepProducts, RecipeStepProductSuggestion } from '@prixfixeco/pfutils';

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
      type: 'SET_INGREDIENT_FOR_RECIPE_STEP_INGREDIENT';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      selectedValidIngredient: RecipeStepIngredient;
      productOfRecipeStepIndex?: number;
      productOfRecipeStepProductIndex?: number;
    }
  | {
      type: 'SET_PRODUCT_FOR_RECIPE_STEP_INGREDIENT';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      selectedIngredient: RecipeStepIngredient;
    }
  | {
      type: 'ADD_INGREDIENT_TO_STEP';
      stepIndex: number;
    }
  | {
      type: 'UNSET_RECIPE_STEP_INGREDIENT';
      stepIndex: number;
      recipeStepIngredientIndex: number;
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
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY'; stepIndex: number; recipeStepIngredientIndex: number; newQuery: string }
  | { type: 'TOGGLE_INGREDIENT_PRODUCT_STATE'; stepIndex: number; recipeStepIngredientIndex: number }
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
      type: 'UNSET_STEP_PRODUCT_MEASUREMENT_UNIT';
      stepIndex: number;
      productIndex: number;
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
      newType: ValidRecipeStepProductType;
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
      recipeStepIngredientIndex: number;
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
      type: 'UNSET_STEP_PREPARATION';
      stepIndex: number;
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
  submissionError: string | null = null;
  showIngredientsSummary: boolean = false;
  showInstrumentsSummary: boolean = false;
  showAdvancedPrepStepInputs: boolean = false;

  stepHelpers: StepHelper[] = [new StepHelper()];

  recipe: RecipeCreationRequestInput = new RecipeCreationRequestInput({
    yieldsPortions: 1,
    steps: [
      new RecipeStepCreationRequestInput({
        instruments: [],
        ingredients: [
          new RecipeStepIngredientCreationRequestInput({
            minimumQuantity: 1,
            maximumQuantity: 1,
          }),
        ],
        products: [
          new RecipeStepProductCreationRequestInput({
            minimumQuantity: 1,
            maximumQuantity: 1,
            type: 'ingredient',
          }),
        ],
      }),
    ],
  });
}

export class StepHelper {
  show: boolean = true;
  locked: boolean = false;

  // preparations
  preparationQuery: string = '';
  preparationSuggestions: ValidPreparation[] = [];
  selectedPreparation: ValidPreparation | null = null;

  // instruments
  instrumentIsRanged: boolean[] = [];
  instrumentSuggestions: RecipeStepInstrument[] = [];
  selectedInstruments: RecipeStepInstrument[] = [];

  // ingredients
  ingredientIsRanged: boolean[] = [false];
  ingredientQueries: string[] = [''];
  ingredientSuggestions: RecipeStepIngredient[][] = [[]];
  ingredientIsProduct: boolean[] = [false];
  selectedIngredients: (RecipeStepIngredient | undefined)[] = [undefined];
  ingredientMeasurementUnitSuggestions: ValidMeasurementUnit[][] = [[]];
  selectedMeasurementUnits: (ValidMeasurementUnit | undefined)[] = [undefined];

  // products
  productIsRanged: boolean[] = [false];
  productIsNamedManually: boolean[] = [false];
  productMeasurementUnitQueries: string[] = [''];
  productMeasurementUnitSuggestions: ValidMeasurementUnit[][] = [[]];
  selectedProductMeasurementUnits: (ValidMeasurementUnit | undefined)[] = [undefined];

  // completion condition ingredient states
  completionConditionIngredientStateQueries: string[] = [];
  completionConditionIngredientStateSuggestions: ValidIngredientState[][] = [];
}

export const useRecipeCreationReducer: Reducer<RecipeCreationPageState, RecipeCreationAction> = (
  state: RecipeCreationPageState,
  action: RecipeCreationAction,
): RecipeCreationPageState => {
  let newState: RecipeCreationPageState = structuredClone(state);

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
      if ((action.newPortions || -1) > 0) {
        newState = { ...state, recipe: { ...state.recipe, yieldsPortions: action.newPortions! } };
      }
      break;
    }

    case 'ADD_STEP': {
      const newStepHelper = new StepHelper();
      newStepHelper.ingredientSuggestions = [
        determineAvailableRecipeStepProducts(state.recipe, state.recipe.steps.length - 1).map((x) => x.product),
      ];

      newState.stepHelpers = [...state.stepHelpers, newStepHelper];
      newState.recipe.steps.push(
        new RecipeStepCreationRequestInput({
          instruments: [],
          ingredients: [
            new RecipeStepIngredientCreationRequestInput({
              minimumQuantity: 1,
              maximumQuantity: 1,
            }),
          ],
          products: [
            new RecipeStepProductCreationRequestInput({
              minimumQuantity: 1,
              type: 'ingredient',
            }),
          ],
          completionConditions: [],
        }),
      );

      break;
    }

    case 'REMOVE_STEP': {
      newState.stepHelpers = newState.stepHelpers.filter(
        (_stepHelper: StepHelper, index: number) => index !== action.stepIndex,
      );
      newState.recipe.steps = newState.recipe.steps.filter(
        (_step: RecipeStepCreationRequestInput, index: number) => index !== action.stepIndex,
      );
      break;
    }

    case 'TOGGLE_SHOW_STEP': {
      newState.stepHelpers[action.stepIndex].show = !newState.stepHelpers[action.stepIndex].show;
      break;
    }

    case 'SET_INGREDIENT_FOR_RECIPE_STEP_INGREDIENT': {
      newState.stepHelpers[action.stepIndex].ingredientQueries[action.recipeStepIngredientIndex] =
        action.selectedValidIngredient.name;
      newState.stepHelpers[action.stepIndex].ingredientSuggestions[action.recipeStepIngredientIndex] = [];
      newState.stepHelpers[action.stepIndex].ingredientMeasurementUnitSuggestions[action.recipeStepIngredientIndex] =
        [];
      newState.stepHelpers[action.stepIndex].selectedIngredients[action.recipeStepIngredientIndex] =
        action.selectedValidIngredient;

      newState.recipe.steps[action.stepIndex].products[0].name = `${
        newState.stepHelpers[action.stepIndex].selectedPreparation?.pastTense
      } ${new Intl.ListFormat('en').format(
        newState.recipe.steps[action.stepIndex].ingredients.map(
          (x: RecipeStepIngredientCreationRequestInput, i: number) =>
            newState.stepHelpers[action.stepIndex]?.selectedIngredients[i]?.name || x.name,
        ),
      )}`;

      newState.recipe.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex] =
        new RecipeStepIngredientCreationRequestInput({
          name: action.selectedValidIngredient.name,
          ingredientID: action.selectedValidIngredient.ingredient?.id,
          measurementUnitID: action.selectedValidIngredient.measurementUnit.id,
          minimumQuantity: action.selectedValidIngredient.minimumQuantity,
          maximumQuantity: action.selectedValidIngredient.maximumQuantity,
          productOfRecipeStepIndex: action.productOfRecipeStepIndex,
          productOfRecipeStepProductIndex: action.productOfRecipeStepProductIndex,
        });

      break;
    }

    case 'ADD_INGREDIENT_TO_STEP': {
      newState.stepHelpers[action.stepIndex].ingredientIsRanged.push(false);
      newState.stepHelpers[action.stepIndex].ingredientQueries.push('');
      newState.stepHelpers[action.stepIndex].ingredientSuggestions.push([]);
      newState.stepHelpers[action.stepIndex].ingredientMeasurementUnitSuggestions.push([]);
      newState.stepHelpers[action.stepIndex].selectedIngredients.push(new RecipeStepIngredient());

      newState.recipe.steps[action.stepIndex].ingredients.push(
        new RecipeStepIngredientCreationRequestInput({
          minimumQuantity: 1,
          maximumQuantity: 1,
        }),
      );
      break;
    }

    case 'UNSET_RECIPE_STEP_INGREDIENT': {
      newState.stepHelpers[action.stepIndex].ingredientQueries[action.recipeStepIngredientIndex] = '';
      newState.stepHelpers[action.stepIndex].ingredientSuggestions[action.recipeStepIngredientIndex] = [];
      newState.stepHelpers[action.stepIndex].ingredientMeasurementUnitSuggestions[action.recipeStepIngredientIndex] =
        [];
      newState.stepHelpers[action.stepIndex].selectedIngredients[action.recipeStepIngredientIndex] = undefined;
      break;
    }

    case 'REMOVE_INGREDIENT_FROM_STEP': {
      newState.stepHelpers[action.stepIndex].ingredientQueries = newState.stepHelpers[
        action.stepIndex
      ].ingredientQueries.filter(
        (_x: string, ingredientIndex: number) => ingredientIndex !== action.recipeStepIngredientIndex,
      );
      newState.stepHelpers[action.stepIndex].ingredientIsRanged = newState.stepHelpers[
        action.stepIndex
      ].ingredientIsRanged?.filter(
        (_x: boolean, ingredientIndex: number) => ingredientIndex !== action.recipeStepIngredientIndex,
      );
      newState.stepHelpers[action.stepIndex].ingredientSuggestions = newState.stepHelpers[
        action.stepIndex
      ].ingredientSuggestions?.filter(
        (_x: RecipeStepIngredient[], ingredientIndex: number) => ingredientIndex !== action.recipeStepIngredientIndex,
      );
      newState.stepHelpers[action.stepIndex].ingredientMeasurementUnitSuggestions = newState.stepHelpers[
        action.stepIndex
      ].ingredientMeasurementUnitSuggestions?.filter(
        (_x: ValidMeasurementUnit[], ingredientIndex: number) => ingredientIndex !== action.recipeStepIngredientIndex,
      );
      newState.recipe.steps[action.stepIndex].ingredients = newState.recipe.steps[action.stepIndex].ingredients.filter(
        (_ingredient: RecipeStepIngredientCreationRequestInput, recipeStepIngredientIndex: number) =>
          recipeStepIngredientIndex !== action.recipeStepIngredientIndex,
      );
      break;
    }

    case 'ADD_INSTRUMENT_TO_STEP': {
      newState.stepHelpers[action.stepIndex].instrumentIsRanged.push(false);
      newState.stepHelpers[action.stepIndex].selectedInstruments.push(action.selectedInstrument);
      newState.recipe.steps[action.stepIndex].instruments.push(action.selectedInstrument);
      break;
    }

    case 'REMOVE_INSTRUMENT_FROM_STEP': {
      newState.stepHelpers[action.stepIndex].instrumentIsRanged = newState.stepHelpers[
        action.stepIndex
      ].instrumentIsRanged.filter(
        (_isRanged: boolean, instrumentIndex: number) => instrumentIndex !== action.recipeStepInstrumentIndex,
      );
      newState.stepHelpers[action.stepIndex].selectedInstruments = newState.stepHelpers[
        action.stepIndex
      ].selectedInstruments.filter(
        (_instrument: RecipeStepInstrument | undefined, instrumentIndex: number) =>
          instrumentIndex !== action.recipeStepInstrumentIndex,
      );
      newState.recipe.steps[action.stepIndex].instruments = newState.recipe.steps[action.stepIndex].instruments.filter(
        (_instrument: RecipeStepInstrumentCreationRequestInput, instrumentIndex: number) =>
          instrumentIndex !== action.recipeStepInstrumentIndex,
      );
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_SUGGESTIONS': {
      newState.stepHelpers[action.stepIndex].ingredientSuggestions[action.recipeStepIngredientIndex] =
        action.results || [];
      break;
    }

    case 'UPDATE_STEP_INSTRUMENT_SUGGESTIONS': {
      newState.stepHelpers[action.stepIndex].instrumentSuggestions = action.results || [];
      break;
    }

    case 'UPDATE_STEP_PREPARATION_QUERY': {
      newState.stepHelpers[action.stepIndex].preparationQuery = action.newQuery;
      break;
    }

    case 'UPDATE_STEP_PREPARATION_SUGGESTIONS': {
      newState.stepHelpers[action.stepIndex].preparationSuggestions = action.results || [];
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_SUGGESTIONS': {
      newState.stepHelpers[action.stepIndex].ingredientMeasurementUnitSuggestions[action.recipeStepIngredientIndex] =
        action.results || [];
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_QUERY': {
      newState.stepHelpers[action.stepIndex].productMeasurementUnitQueries[action.productIndex] = action.newQuery;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT_SUGGESTIONS': {
      newState.stepHelpers[action.stepIndex].productMeasurementUnitSuggestions[action.productIndex] =
        action.results || [];
      break;
    }

    case 'UNSET_STEP_PRODUCT_MEASUREMENT_UNIT': {
      newState.stepHelpers[action.stepIndex].productMeasurementUnitQueries[action.productIndex] = '';
      newState.stepHelpers[action.stepIndex].productMeasurementUnitSuggestions[action.productIndex] = [];
      newState.stepHelpers[action.stepIndex].selectedProductMeasurementUnits[action.productIndex] = undefined;
      newState.recipe.steps[action.stepIndex].products[action.productIndex].measurementUnitID = '';
      break;
    }

    case 'ADD_COMPLETION_CONDITION_TO_STEP': {
      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateQueries.push('');
      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateSuggestions.push([]);
      newState.recipe.steps[action.stepIndex].completionConditions.push(
        new RecipeStepCompletionConditionCreationRequestInput(),
      );
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_QUERY': {
      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateQueries[action.conditionIndex] =
        action.query;
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE_SUGGESTIONS': {
      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateSuggestions[action.conditionIndex] =
        action.results || [];
      break;
    }

    case 'UPDATE_COMPLETION_CONDITION_INGREDIENT_STATE': {
      if (!action.ingredientState) {
        console.error("couldn't find ingredient state to add");
        break;
      }

      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateQueries[action.conditionIndex] =
        action.ingredientState.name;
      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateSuggestions[action.conditionIndex] = [];

      newState.recipe.steps[action.stepIndex].completionConditions[action.conditionIndex].ingredientState =
        action.ingredientState!.id;
      break;
    }

    case 'REMOVE_RECIPE_STEP_COMPLETION_CONDITION': {
      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateQueries = newState.stepHelpers[
        action.stepIndex
      ].completionConditionIngredientStateQueries.filter(
        (_: string, conditionIndex: number) => conditionIndex !== action.conditionIndex,
      );

      newState.stepHelpers[action.stepIndex].completionConditionIngredientStateSuggestions = newState.stepHelpers[
        action.stepIndex
      ].completionConditionIngredientStateSuggestions.filter(
        (_: ValidIngredientState[], conditionIndex: number) => conditionIndex !== action.conditionIndex,
      );

      newState.recipe.steps[action.stepIndex].completionConditions = newState.recipe.steps[
        action.stepIndex
      ].completionConditions.filter(
        (_: RecipeStepCompletionConditionCreationRequestInput, conditionIndex: number) =>
          conditionIndex !== action.conditionIndex,
      );
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT': {
      if (!action.measurementUnit) {
        console.error("couldn't find measurement unit to add for step ingredient");
        break;
      }

      newState.stepHelpers[action.stepIndex].selectedMeasurementUnits[action.recipeStepIngredientIndex] =
        action.measurementUnit!;
      newState.recipe.steps[action.stepIndex].ingredients[action.recipeStepIngredientIndex].measurementUnitID =
        action.measurementUnit!.id;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_MEASUREMENT_UNIT': {
      if (!action.measurementUnit) {
        console.error("couldn't find measurement unit to add");
        break;
      }

      newState.stepHelpers[action.stepIndex].selectedProductMeasurementUnits[action.productIndex] =
        action.measurementUnit;
      newState.recipe.steps[action.stepIndex].products[action.productIndex].measurementUnitID =
        action.measurementUnit!.id;
      break;
    }

    case 'UPDATE_STEP_PRODUCT_TYPE': {
      newState.stepHelpers[action.stepIndex].productMeasurementUnitSuggestions[action.productIndex] = [];
      newState.recipe.steps[action.stepIndex].products[action.productIndex].type = action.newType;
      newState.recipe.steps[action.stepIndex].products[action.productIndex].minimumQuantity = 1;
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

    case 'UNSET_STEP_PREPARATION': {
      // we need to effectively reset the step, since the preparation is the root.
      newState.stepHelpers[action.stepIndex].selectedPreparation = null;
      newState.stepHelpers[action.stepIndex].preparationQuery = '';
      newState.stepHelpers[action.stepIndex].ingredientSuggestions = [];
      newState.stepHelpers[action.stepIndex].preparationSuggestions = [];
      newState.stepHelpers[action.stepIndex].instrumentSuggestions = [];

      newState.recipe.steps[action.stepIndex].products = [
        new RecipeStepProductCreationRequestInput({
          minimumQuantity: 1,
          type: 'ingredient',
        }),
      ];

      break;
    }

    case 'UPDATE_STEP_PREPARATION': {
      // we need to effectively reset the step, since the preparation is the root.
      newState.stepHelpers[action.stepIndex].selectedPreparation = action.selectedPreparation;
      newState.stepHelpers[action.stepIndex].preparationQuery = action.selectedPreparation.name;
      newState.stepHelpers[action.stepIndex].preparationSuggestions = [];

      newState.recipe.steps[action.stepIndex].preparationID = action.selectedPreparation.id;
      newState.recipe.steps[action.stepIndex].instruments = [];
      newState.recipe.steps[action.stepIndex].products = [
        new RecipeStepProductCreationRequestInput({
          minimumQuantity: 1,
          type: 'ingredient',
        }),
      ];
      newState.recipe.steps[action.stepIndex].ingredients = [
        new RecipeStepIngredientCreationRequestInput({
          minimumQuantity: 1,
          maximumQuantity: 1,
        }),
      ];
      newState.recipe.steps[action.stepIndex].completionConditions = [];
      break;
    }

    case 'UPDATE_STEP_NOTES': {
      newState.recipe.steps[action.stepIndex].notes = action.newNotes;
      break;
    }

    case 'UPDATE_STEP_INGREDIENT_QUERY': {
      newState.stepHelpers[action.stepIndex].ingredientQueries[action.recipeStepIngredientIndex] = action.newQuery;
      break;
    }

    case 'TOGGLE_INGREDIENT_PRODUCT_STATE': {
      newState.stepHelpers[action.stepIndex].ingredientIsProduct[action.recipeStepIngredientIndex] =
        !newState.stepHelpers[action.stepIndex].ingredientIsProduct[action.recipeStepIngredientIndex];
      break;
    }

    case 'TOGGLE_INGREDIENT_RANGE': {
      newState.stepHelpers[action.stepIndex].ingredientIsRanged[action.recipeStepIngredientIndex] =
        !newState.stepHelpers[action.stepIndex].ingredientIsRanged[action.recipeStepIngredientIndex];
      break;
    }

    case 'TOGGLE_INSTRUMENT_RANGE': {
      newState.stepHelpers[action.stepIndex].instrumentIsRanged[action.recipeStepInstrumentIndex] =
        !newState.stepHelpers[action.stepIndex].instrumentIsRanged[action.recipeStepInstrumentIndex];
      break;
    }

    case 'TOGGLE_PRODUCT_RANGE': {
      newState.stepHelpers[action.stepIndex].productIsRanged[action.productIndex] =
        !newState.stepHelpers[action.stepIndex].productIsRanged[action.productIndex];
      break;
    }

    case 'TOGGLE_MANUAL_PRODUCT_NAMING': {
      newState.stepHelpers[action.stepIndex].productIsNamedManually[action.productIndex] =
        !newState.stepHelpers[action.stepIndex].productIsNamedManually[action.productIndex];
      newState.recipe.steps[action.stepIndex].products[action.productIndex].name = newState.stepHelpers[
        action.stepIndex
      ].productIsNamedManually[action.productIndex]
        ? ''
        : `${newState.stepHelpers[action.stepIndex].selectedPreparation?.pastTense} ${new Intl.ListFormat('en').format(
            newState.recipe.steps[action.stepIndex].ingredients.map(
              (x: RecipeStepIngredientCreationRequestInput, i: number) =>
                newState.stepHelpers[action.stepIndex]?.selectedIngredients[i]?.name || x.name,
            ),
          )}`;
      break;
    }

    default:
      console.error(`Unhandled action type`);
  }

  console.dir(`${action.type}\n`, {
    action,
    state,
    newState,
  });

  return newState;
};
