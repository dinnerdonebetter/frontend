import { Reducer } from 'react';
import { immerable, produce } from 'immer';

import { RecipeCreationRequestInput } from '@prixfixeco/models';

const debugTypes = new Set(['']);

type NewRecipeCreationAction = { type: 'SET_RECIPE_NAME'; newName: string };

export class NewRecipeCreationPageState {
  [immerable] = true;

  // recipe stuff
  name: string = '';
  source: string = '';
  description: string = '';
  alsoCreateMeal: boolean = false;
  yieldsPortions: number = 1;
  steps: NewRecipeStepCreationPageState[] = [new NewRecipeStepCreationPageState()];

  // meta stuff
  stepHelpers: NewRecipeCreationPageStepHelper[] = [new NewRecipeCreationPageStepHelper()];
  showIngredientsSummary: boolean = false;
  showInstrumentsSummary: boolean = false;
  showAdvancedPrepStepInputs: boolean = false;

  toRecipeStepCreationInput(): RecipeCreationRequestInput {
    return new RecipeCreationRequestInput({
      name: this.name,
    });
  }
}

export class NewRecipeCreationPageStepHelper {
  show: boolean = true;
}

export class NewRecipeStepCreationPageState {
  [immerable] = true;

  minimumTemperatureInCelsius?: number;
  maximumTemperatureInCelsius?: number;
  notes: string = '';
  preparationID: string = '';
  index: number = -1;
  minimumEstimatedTimeInSeconds?: number;
  maximumEstimatedTimeInSeconds?: number;
  optional: boolean = false;
  explicitInstructions: string = '';
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
