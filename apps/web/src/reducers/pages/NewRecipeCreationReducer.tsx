import { Reducer } from 'react';
import { immerable, produce } from 'immer';

import { IValidPreparation, RecipeCreationRequestInput } from '@prixfixeco/models';

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

  // meta stuff for the page
  show: boolean = true;
  preparationQuery: string = '';
  selectedPreparation: IValidPreparation | null = null;
  preparationSuggestions: IValidPreparation[] = [];
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
