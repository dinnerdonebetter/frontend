import { Reducer } from 'react';
import { immerable, produce } from 'immer';

import {
  IRecipeStepIngredient,
  IRecipeStepInstrument,
  IValidIngredient,
  IValidIngredientState,
  IValidInstrument,
  IValidMeasurementUnit,
  IValidPreparation,
  RecipeCreationRequestInput,
} from '@prixfixeco/models';

const debugTypes = new Set(['']);

type NewRecipeCreationAction = { type: 'SET_RECIPE_NAME'; newName: string };

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

  // meta stuff for the page
  show: boolean = true;
  selectedPreparation: IValidPreparation | null = null;

  // ingredientMeasurementUnitSuggestions: IValidMeasurementUnit[][] = [];
  // productMeasurementUnitSuggestions: IValidMeasurementUnit[][] = [[]];
  // completionConditionIngredientStateSuggestions: IValidIngredientState[][] = [[]];
  // preparationSuggestions: IValidPreparation[] = [];
  // ingredientSuggestions: IValidIngredient[] = [];
  // instrumentSuggestions: IRecipeStepInstrument[] = [];

  instrumentIsRanged: boolean[][] = [];
  ingredientIsRanged: boolean[][] = [];
  productIsRanged: boolean[][] = [[false]];

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

export const useNewRecipeCreationReducer: Reducer<NewRecipeCreationPageState, NewRecipeCreationAction> = (
  state: NewRecipeCreationPageState,
  action: NewRecipeCreationAction,
) =>
  produce(state, (draft) => {
    console.log(`NewRecipeCreationReducer: ${action.type} ${action.newName}`);

    switch (action.type) {
      case 'SET_RECIPE_NAME': {
        draft.name = action.newName;
        break;
      }

      default:
        break;
    }
  });
