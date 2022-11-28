import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Grid,
  Text,
  Stack,
  Textarea,
  TextInput,
  Title,
  Autocomplete,
  AutocompleteItem,
  NumberInput,
  Select,
  Switch,
  Space,
  Collapse,
  Box,
} from '@mantine/core';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconEye, IconEyeOff, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { Reducer, useEffect, useReducer } from 'react';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  ValidIngredient,
  ValidMeasurementUnit,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidPreparationInstrumentList,
} from '@prixfixeco/models';

import { AppLayout } from '../../lib/layouts';
import { buildLocalClient } from '../../lib/client';

const debugTypes = new Set(['ADD_INGREDIENT_TO_STEP']);

/* BEGIN Recipe Creation Reducer */

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
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'UPDATE_NAME'; newName: string }
  | { type: 'UPDATE_DESCRIPTION'; newDescription: string }
  | { type: 'UPDATE_SOURCE'; newSource: string }
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
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY';
      newQuery: string;
      stepIndex: number;
      recipeStepIngredientIndex: number;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      measurementUnitName: string;
    }
  | {
      type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS';
      stepIndex: number;
      results: ValidIngredient[];
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
      type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS';
      stepIndex: number;
      recipeStepIngredientIndex: number;
      results: ValidMeasurementUnit[];
    }
  | {
      type: 'UPDATE_STEP_PREPARATION';
      stepIndex: number;
      preparationName: string;
    }
  | {
      type: 'UPDATE_PRODUCT_NAME';
      newName: string;
      stepIndex: number;
      productIndex: number;
    }
  | { type: 'TOGGLE_INGREDIENT_RANGE'; stepIndex: number; recipeStepIngredientIndex: number }
  | { type: 'TOGGLE_INSTRUMENT_RANGE'; stepIndex: number; recipeStepInstrumentIndex: number };

export class RecipeCreationPageState {
  submissionShouldBePrevented: boolean = true;
  submissionError: string | null = null;
  showIngredientsSummary: boolean = false;
  showInstrumentsSummary: boolean = false;

  recipe: Recipe = new Recipe({
    steps: [
      new RecipeStep({
        instruments: [],
        ingredients: [],
        products: [new RecipeStepProduct()],
      }),
    ],
  });

  instrumentIsRanged: boolean[][] = [];
  ingredientIsRanged: boolean[][] = [];

  // ingredient measurement units
  ingredientMeasurementUnitQueries: string[][] = [];
  ingredientMeasurementUnitQueryToExecute: queryUpdateData | null = null;
  ingredientMeasurementUnitSuggestions: ValidMeasurementUnit[][][] = [[]];

  // preparations
  preparationQueries: string[] = [''];
  preparationQueryToExecute: queryUpdateData | null = null;
  preparationSuggestions: ValidPreparation[][] = [[]];

  // ingredients
  ingredientQueries: string[] = [''];
  ingredientQueryToExecute: queryUpdateData | null = null;
  ingredientSuggestions: ValidIngredient[][] = [[]];

  // instruments
  instrumentQueryToExecute: queryUpdateData | null = null;
  instrumentSuggestions: ValidPreparationInstrument[][] = [[]];
}

const useMealCreationReducer: Reducer<RecipeCreationPageState, RecipeCreationAction> = (
  state: RecipeCreationPageState,
  action: RecipeCreationAction,
): RecipeCreationPageState => {
  if (debugTypes.has(action.type)) {
    console.debug(`[useMealCreationReducer] action: ${JSON.stringify(action)}`);
  }

  let newState: RecipeCreationPageState = { ...state };

  switch (action.type) {
    case 'TOGGLE_SHOW_ALL_INGREDIENTS': {
      newState = {
        ...state,
        showIngredientsSummary: !newState.showIngredientsSummary,
      };
      break;
    }

    case 'TOGGLE_SHOW_ALL_INSTRUMENTS': {
      newState = {
        ...state,
        showInstrumentsSummary: !newState.showInstrumentsSummary,
      };
      break;
    }

    case 'UPDATE_SUBMISSION_ERROR': {
      newState.submissionError = action.error;
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

    case 'ADD_STEP': {
      newState = {
        ...state,
        ingredientQueries: [...state.ingredientQueries, ''],
        ingredientSuggestions: [...state.ingredientSuggestions, []],
        preparationQueries: [...state.preparationQueries, ''],
        preparationSuggestions: [...state.preparationSuggestions, []],
        instrumentSuggestions: [...state.instrumentSuggestions, []],
        recipe: {
          ...state.recipe,
          steps: [
            ...state.recipe.steps,
            new RecipeStep({
              media: [],
              instruments: [],
              ingredients: [],
              products: [new RecipeStepProduct()],
            }),
          ],
        },
      };
      break;
    }

    case 'REMOVE_STEP': {
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.filter((_step: RecipeStep, index: number) => index !== action.stepIndex),
        },
      };
      break;
    }

    case 'ADD_INGREDIENT_TO_STEP': {
      const selectedIngredient = (state.ingredientSuggestions[action.stepIndex] || []).find(
        (ingredientSuggestion: ValidIngredient) => ingredientSuggestion.name === action.ingredientName,
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

      newState = {
        ...state,
        ingredientQueries: state.ingredientQueries.map((query: string, stepIndex: number) => {
          return stepIndex === action.stepIndex ? '' : query || '';
        }),
        ingredientSuggestions: (state.ingredientSuggestions || []).map(
          (suggestions: ValidIngredient[], stepIndex: number) => {
            return stepIndex === action.stepIndex ? [] : suggestions || [];
          },
        ),
        ingredientMeasurementUnitSuggestions: buildNewIngredientMeasurementUnitSuggestions(),
        ingredientMeasurementUnitQueries: buildNewIngredientMeasurementUnitQueries(),
        ingredientIsRanged: buildNewIngredientRangedStates(),
        ingredientQueryToExecute: null,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  ingredients: [
                    ...step.ingredients,
                    new RecipeStepIngredient({
                      name: selectedIngredient.name,
                      ingredient: selectedIngredient,
                      productOfRecipeStep: false,
                      minimumQuantity: 1,
                      maximumQuantity: 1,
                      optionIndex: 0,
                    }),
                  ],
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

      newState = {
        ...state,
        instrumentIsRanged: buildNewInstrumentRangedStates(),
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  instruments: [
                    ...step.instruments,
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
                  ],
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
          (ingredientSuggestionsForStepIngredientSlot: ValidIngredient[], stepIndex: number) => {
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
          (instrumentSuggestionsForStep: ValidPreparationInstrument[], stepIndex: number) => {
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

    case 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT': {
      const selectedMeasurementUnit = (
        state.ingredientMeasurementUnitSuggestions[action.stepIndex][action.recipeStepIngredientIndex] || []
      ).find(
        (ingredientMeasurementUnitSuggestion: ValidMeasurementUnit) =>
          ingredientMeasurementUnitSuggestion.name === action.measurementUnitName,
      );

      if (!selectedMeasurementUnit) {
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
                  ingredients: step.ingredients.map((ingredient: RecipeStepIngredient, ingredientIndex: number) => {
                    return ingredientIndex === action.recipeStepIngredientIndex
                      ? {
                          ...ingredient,
                          measurementUnit: selectedMeasurementUnit,
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

      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            return stepIndex === action.stepIndex
              ? {
                  ...step,
                  preparation: selectedPreparation,
                }
              : step;
          }),
        },
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

    default:
      console.error(`Unhandled action type`);
  }

  if (debugTypes.has(action.type)) {
    console.debug(`[useMealCreationReducer] returned state: ${JSON.stringify(newState)}`);
  }

  return newState;
};

/* END Recipe Creation Reducer */

function RecipesPage() {
  const router = useRouter();
  const apiClient = buildLocalClient();

  const [pageState, updatePageState] = useReducer(useMealCreationReducer, new RecipeCreationPageState());

  const submitRecipe = async () => {
    apiClient
      .createRecipe(Recipe.toCreationRequestInput(pageState.recipe))
      .then((res: AxiosResponse<Recipe>) => {
        router.push(`/meals/${res.data.id}`);
      })
      .catch((err: AxiosError) => {
        console.error(`Failed to create meal: ${err}`);
      });
  };

  useEffect(() => {
    if (pageState.preparationQueryToExecute?.query) {
      apiClient
        .searchForValidPreparations(pageState.preparationQueryToExecute.query)
        .then((res: AxiosResponse<ValidPreparation[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_PREPARATION_QUERY_RESULTS',
            stepIndex: pageState.preparationQueryToExecute!.stepIndex,
            results: res.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparations: ${err}`);
        });
    }
  }, [pageState.preparationQueryToExecute]);

  useEffect(() => {
    if (pageState.ingredientQueryToExecute?.query) {
      apiClient
        .searchForValidIngredients(pageState.ingredientQueryToExecute.query)
        .then((res: AxiosResponse<ValidIngredient[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS',
            stepIndex: pageState.ingredientQueryToExecute!.stepIndex,
            results:
              res.data.filter((validIngredient: ValidIngredient) => {
                let found = false;

                pageState.recipe.steps[pageState.ingredientQueryToExecute!.stepIndex].ingredients.forEach(
                  (ingredient) => {
                    if ((ingredient.ingredient?.id || '') === validIngredient.id) {
                      found = true;
                    }
                  },
                );

                // return true if the ingredient is not already used by another ingredient in the step
                return !found;
              }) || [],
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredients: ${err}`);
        });
    }
  }, [pageState.ingredientQueryToExecute]);

  useEffect(() => {
    if (pageState.instrumentQueryToExecute?.query) {
      apiClient
        .validPreparationInstrumentsForPreparationID(pageState.instrumentQueryToExecute.query)
        .then((res: AxiosResponse<ValidPreparationInstrumentList>) => {
          updatePageState({
            type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS',
            stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
            results: res.data.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get preparation instruments: ${err}`);
        });
    }
  }, [pageState.instrumentQueryToExecute]);

  useEffect(() => {
    if (pageState.ingredientMeasurementUnitQueryToExecute?.query) {
      apiClient
        .searchForValidMeasurementUnits(pageState.ingredientMeasurementUnitQueryToExecute.query)
        .then((res: AxiosResponse<ValidMeasurementUnit[]>) => {
          updatePageState({
            type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY_RESULTS',
            stepIndex: pageState.ingredientMeasurementUnitQueryToExecute!.stepIndex,
            recipeStepIngredientIndex: pageState.ingredientMeasurementUnitQueryToExecute!.secondaryIndex!,
            results: res.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredient measurement units: ${err}`);
        });
    }
  }, [pageState.ingredientMeasurementUnitQueryToExecute]);

  const steps = pageState.recipe.steps.map((step, stepIndex) => {
    return (
      <Card key={stepIndex} shadow="sm" radius="md" withBorder sx={{ width: '100%', marginBottom: '1rem' }}>
        {/* this is the top of the recipe step view, with the step index indicator and the delete step button */}
        <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
          <Grid justify="space-between" align="center">
            <Grid.Col span="auto">
              <Text weight="bold">{`Step #${stepIndex + 1}`}</Text>
            </Grid.Col>
            <Grid.Col span="auto">
              <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={pageState.recipe.steps.length === 1}
                onClick={() => updatePageState({ type: 'REMOVE_STEP', stepIndex: stepIndex })}
              >
                <IconTrash size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        {/* this is the first input section, which */}
        <Card.Section px="xs" pb="xs">
          <Grid>
            <Grid.Col md="auto" sm={12}>
              <Textarea
                label="Notes"
                value={pageState.recipe.steps[stepIndex].notes}
                minRows={2}
                onChange={(event) =>
                  updatePageState({
                    type: 'UPDATE_STEP_NOTES',
                    stepIndex: stepIndex,
                    newDescription: event.target.value,
                  })
                }
              />

              <Space h="xl" />

              <Stack>
                <Autocomplete
                  label="Preparation"
                  required
                  tabIndex={0}
                  value={pageState.preparationQueries[stepIndex]}
                  onChange={(value) =>
                    updatePageState({
                      type: 'UPDATE_STEP_PREPARATION_QUERY',
                      stepIndex: stepIndex,
                      newQuery: value,
                    })
                  }
                  data={pageState.preparationSuggestions[stepIndex]
                    .filter((x: ValidPreparation) => {
                      return x.name !== pageState.recipe.steps[stepIndex].preparation.name;
                    })
                    .map((x: ValidPreparation) => ({
                      value: x.name,
                      label: x.name,
                    }))}
                  onItemSubmit={(value) => {
                    updatePageState({
                      type: 'UPDATE_STEP_PREPARATION',
                      stepIndex: stepIndex,
                      preparationName: value.value,
                    });
                  }}
                />

                <Select
                  label="Instrument(s)"
                  required
                  onChange={(instrument) => {
                    if (instrument) {
                      updatePageState({
                        type: 'ADD_INSTRUMENT_TO_STEP',
                        stepIndex: stepIndex,
                        instrumentName: instrument,
                      });
                    }
                  }}
                  value={''}
                  disabled={pageState.instrumentSuggestions[stepIndex].length === 0}
                  data={pageState.instrumentSuggestions[stepIndex]
                    .filter((x: ValidPreparationInstrument) => {
                      return !pageState.recipe.steps[stepIndex].instruments.find(
                        (y: RecipeStepInstrument) => y.name === x.instrument?.name,
                      );
                    })
                    .map((x: ValidPreparationInstrument) => ({
                      value: x.instrument.name,
                      label: x.instrument.name,
                    }))}
                />

                {pageState.recipe.steps[stepIndex].instruments.map(
                  (x: RecipeStepInstrument, recipeStepInstrumentIndex: number) => (
                    <Box key={recipeStepInstrumentIndex}>
                      <Grid>
                        <Grid.Col span="auto">
                          <Text mt="xl">{`${x.instrument?.name || x.name}`}</Text>
                        </Grid.Col>

                        <Grid.Col span="content">
                          <Switch
                            mt="sm"
                            size="md"
                            onLabel="ranged"
                            offLabel="simple"
                            value={
                              pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] ? 'ranged' : 'simple'
                            }
                            onChange={() =>
                              updatePageState({
                                type: 'TOGGLE_INSTRUMENT_RANGE',
                                stepIndex,
                                recipeStepInstrumentIndex,
                              })
                            }
                          />
                        </Grid.Col>

                        <Grid.Col span="content" mt="sm">
                          <ActionIcon
                            mt="sm"
                            variant="outline"
                            size="sm"
                            aria-label="remove recipe step instrument"
                            onClick={() =>
                              updatePageState({
                                type: 'REMOVE_INSTRUMENT_FROM_STEP',
                                stepIndex,
                                recipeStepInstrumentIndex,
                              })
                            }
                          >
                            <IconTrash size="md" color="darkred" />
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>

                      <Grid>
                        <Grid.Col span={pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] ? 6 : 12}>
                          <NumberInput
                            label={
                              pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex]
                                ? 'Min Amount'
                                : 'Amount'
                            }
                            value={
                              pageState.recipe.steps[stepIndex].instruments[recipeStepInstrumentIndex].minimumQuantity
                            }
                            maxLength={0}
                          />
                        </Grid.Col>

                        {pageState.instrumentIsRanged[stepIndex][recipeStepInstrumentIndex] && (
                          <Grid.Col span={6}>
                            <NumberInput
                              label="Max Amount"
                              maxLength={0}
                              value={
                                pageState.recipe.steps[stepIndex].instruments[recipeStepInstrumentIndex].maximumQuantity
                              }
                            />
                          </Grid.Col>
                        )}
                      </Grid>
                    </Box>
                  ),
                )}
              </Stack>

              <Space h="xl" />

              <Divider label="consumes" labelPosition="center" mb="md" />

              <Autocomplete
                label="Ingredients"
                required
                value={pageState.ingredientQueries[stepIndex]}
                onChange={(value) =>
                  updatePageState({
                    type: 'UPDATE_STEP_INGREDIENT_QUERY',
                    newQuery: value,
                    stepIndex: stepIndex,
                  })
                }
                disabled={pageState.recipe.steps[stepIndex].preparation.name.trim() === ''}
                onItemSubmit={(item: AutocompleteItem) => {
                  updatePageState({
                    type: 'ADD_INGREDIENT_TO_STEP',
                    stepIndex: stepIndex,
                    ingredientName: item.value,
                  });
                }}
                data={pageState.ingredientSuggestions[stepIndex].map((x: ValidIngredient) => ({
                  value: x.name,
                  label: x.name,
                }))}
                // dropdownPosition="bottom" // TODO: this doesn't work because the card component eats it up
              />

              {pageState.recipe.steps[stepIndex].ingredients.map(
                (x: RecipeStepIngredient, recipeStepIngredientIndex: number) => (
                  <Box key={recipeStepIngredientIndex}>
                    <Grid>
                      <Grid.Col span="auto">
                        <Text mt="xl">{`${x.ingredient?.name || x.name}`}</Text>
                      </Grid.Col>

                      <Grid.Col span="content">
                        <Switch
                          mt="sm"
                          size="md"
                          onLabel="ranged"
                          offLabel="simple"
                          value={
                            pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 'ranged' : 'simple'
                          }
                          onChange={() =>
                            updatePageState({
                              type: 'TOGGLE_INGREDIENT_RANGE',
                              stepIndex,
                              recipeStepIngredientIndex,
                            })
                          }
                        />
                      </Grid.Col>

                      <Grid.Col span="content" mt="sm">
                        <ActionIcon
                          mt="sm"
                          variant="outline"
                          size="sm"
                          aria-label="remove recipe step ingredient"
                          onClick={() =>
                            updatePageState({
                              type: 'REMOVE_INGREDIENT_FROM_STEP',
                              stepIndex,
                              recipeStepIngredientIndex,
                            })
                          }
                        >
                          <IconTrash size="md" color="darkred" />
                        </ActionIcon>
                      </Grid.Col>
                    </Grid>

                    <Grid>
                      <Grid.Col span={6}>
                        <NumberInput
                          label={
                            pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 'Min Amount' : 'Amount'
                          }
                          value={
                            pageState.recipe.steps[stepIndex].ingredients[recipeStepIngredientIndex].minimumQuantity
                          }
                          maxLength={0}
                        />
                      </Grid.Col>

                      {pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] && (
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Max Amount"
                            maxLength={0}
                            value={
                              pageState.recipe.steps[stepIndex].ingredients[recipeStepIngredientIndex].maximumQuantity
                            }
                          />
                        </Grid.Col>
                      )}

                      <Grid.Col span={pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex] ? 12 : 6}>
                        <Autocomplete
                          label="Measurement"
                          value={pageState.ingredientMeasurementUnitQueries[stepIndex][recipeStepIngredientIndex]}
                          onChange={(value) =>
                            updatePageState({
                              type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT_QUERY',
                              newQuery: value,
                              stepIndex,
                              recipeStepIngredientIndex,
                            })
                          }
                          data={pageState.ingredientMeasurementUnitSuggestions[stepIndex][
                            recipeStepIngredientIndex
                          ].map((x: ValidMeasurementUnit) => ({
                            value: x.name,
                            label: x.name,
                          }))}
                          onItemSubmit={(item: AutocompleteItem) => {
                            updatePageState({
                              type: 'UPDATE_STEP_INGREDIENT_MEASUREMENT_UNIT',
                              stepIndex,
                              recipeStepIngredientIndex,
                              measurementUnitName: item.value,
                            });
                          }}
                        />
                      </Grid.Col>
                    </Grid>
                  </Box>
                ),
              )}

              <Divider label="produces" labelPosition="center" my="md" />

              {step.products.map((product, productIndex) => {
                return (
                  <Grid key={productIndex}>
                    <Grid.Col md={4} sm={12}>
                      <Select label="Type" value="ingredient" data={['ingredient', 'instrument']} />
                    </Grid.Col>

                    <Grid.Col md="auto" sm={12}>
                      <Autocomplete label="Measurement" value={product.name} data={[]} onChange={(_value) => {}} />
                    </Grid.Col>

                    <Grid.Col span="auto">
                      <TextInput label="Name" disabled value={product.name} onChange={(_value) => {}} />
                    </Grid.Col>

                    <Grid.Col span="content" mt="xl">
                      <ActionIcon
                        mt={5}
                        style={{ float: 'right' }}
                        variant="outline"
                        size="md"
                        aria-label="add product"
                        disabled={step.products.length <= 1}
                        onClick={() => {}}
                      >
                        <IconPencil size="md" />
                      </ActionIcon>
                    </Grid.Col>

                    {productIndex === 0 && (
                      <Grid.Col span="content" mt="xl">
                        <ActionIcon
                          mt={5}
                          style={{ float: 'right' }}
                          variant="outline"
                          size="md"
                          aria-label="add product"
                          disabled={step.products.length <= 1}
                          onClick={() => {}}
                        >
                          <IconPlus size="md" />
                        </ActionIcon>
                      </Grid.Col>
                    )}
                  </Grid>
                );
              })}
            </Grid.Col>
          </Grid>
        </Card.Section>
      </Card>
    );
  });

  return (
    <AppLayout title="New Recipe" containerSize="xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitRecipe();
        }}
      >
        <Grid>
          <Grid.Col md={4} sm={12}>
            <Stack>
              <Stack>
                <TextInput
                  withAsterisk
                  label="Name"
                  value={pageState.recipe.name}
                  onChange={(event) => updatePageState({ type: 'UPDATE_NAME', newName: event.target.value })}
                  mt="xs"
                />
                <TextInput
                  label="Source"
                  value={pageState.recipe.source}
                  onChange={(event) => updatePageState({ type: 'UPDATE_SOURCE', newSource: event.target.value })}
                  mt="xs"
                />
                <Textarea
                  label="Description"
                  value={pageState.recipe.description}
                  onChange={(event) =>
                    updatePageState({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value })
                  }
                  minRows={4}
                  mt="xs"
                />
                <Button onClick={() => {}} disabled>
                  Save
                </Button>
              </Stack>

              <Grid justify="space-between" align="center">
                <Grid.Col span="auto">
                  <Title order={4}>All Ingredients</Title>
                </Grid.Col>

                <Grid.Col span="auto">
                  <ActionIcon
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="remove step"
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INGREDIENTS' })}
                  >
                    {(pageState.showIngredientsSummary && (
                      <IconEyeOff size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
                    )) || <IconEye size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Divider />

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showIngredientsSummary}>
                <Box />
              </Collapse>

              <Grid justify="space-between" align="center">
                <Grid.Col span="auto">
                  <Title order={4}>All Instruments</Title>
                </Grid.Col>
                <Grid.Col span="auto">
                  <ActionIcon
                    variant="outline"
                    size="sm"
                    style={{ float: 'right' }}
                    aria-label="remove step"
                    onClick={() => updatePageState({ type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' })}
                  >
                    {(pageState.showInstrumentsSummary && (
                      <IconEyeOff size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
                    )) || <IconEye size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />}
                  </ActionIcon>
                </Grid.Col>
              </Grid>

              <Divider />

              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showInstrumentsSummary}>
                <Box>{/* TODO */}</Box>
              </Collapse>
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto" mt={'2.2rem'} mb="xl">
            {steps}
            <Button fullWidth onClick={() => updatePageState({ type: 'ADD_STEP' })} mb="xl">
              Add Step
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}

export default RecipesPage;
