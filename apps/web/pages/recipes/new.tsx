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
  Center,
} from '@mantine/core';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconFoldDown, IconFoldUp, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { Reducer, useEffect, useReducer, useState } from 'react';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  ValidIngredient,
  ValidPreparation,
  ValidPreparationInstrument,
  ValidPreparationInstrumentList,
} from '@prixfixeco/models';

import { AppLayout } from '../../lib/layouts';
import { buildLocalClient } from '../../lib/client';

const debugTypes = new Set(['REMOVE_INGREDIENT_FROM_STEP']);

/* BEGIN Recipe Creation Reducer */

interface queryUpdateData {
  query: string;
  stepIndex: number;
}

const recipeSubmissionShouldBeDisabled = (pageState: RecipeCreationPageState): boolean => {
  const componentProblems: string[] = [];

  return !(pageState.recipe.name.length > 0 && pageState.recipe.steps.length > 0 && componentProblems.length === 0);
};

const buildInitialRecipe = (): Recipe => {
  return new Recipe({
    steps: [
      new RecipeStep({
        instruments: [],
        ingredients: [],
        products: [new RecipeStepProduct()],
      }),
    ],
  });
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
  | { type: 'REMOVE_INGREDIENT_FROM_STEP'; stepIndex: number; ingredientIndex: number }
  | { type: 'REMOVE_INSTRUMENT_FROM_STEP'; stepIndex: number; instrumentIndex: number }
  | { type: 'UPDATE_STEP_PREPARATION_QUERY'; stepIndex: number; newQuery: string }
  | { type: 'UPDATE_STEP_NOTES'; stepIndex: number; newDescription: string }
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY'; stepIndex: number; newQuery: string }
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
      type: 'UPDATE_STEP_PREPARATION';
      stepIndex: number;
      preparationName: string;
    }
  | {
      type: 'UPDATE_PRODUCT_NAME';
      newName: string;
      stepIndex: number;
      productIndex: number;
    };

export class RecipeCreationPageState {
  submissionShouldBePrevented: boolean = true;
  submissionError: string | null = null;
  showIngredientsSummary: boolean = false;
  showInstrumentsSummary: boolean = false;

  recipe: Recipe = buildInitialRecipe();

  ingredientIsRanged: boolean[][] = [[]];

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
    case 'TOGGLE_SHOW_ALL_INGREDIENTS':
      newState.showIngredientsSummary = !newState.showIngredientsSummary;
      break;
    case 'TOGGLE_SHOW_ALL_INSTRUMENTS':
      newState.showInstrumentsSummary = !newState.showInstrumentsSummary;
      break;

    case 'UPDATE_SUBMISSION_ERROR':
      newState.submissionError = action.error;
      break;

    case 'UPDATE_NAME':
      newState = {
        ...state,
        recipe: { ...state.recipe, name: action.newName },
        submissionShouldBePrevented: recipeSubmissionShouldBeDisabled(state),
      };
      break;

    case 'UPDATE_DESCRIPTION':
      newState.recipe = { ...state.recipe, description: action.newDescription };
      break;

    case 'UPDATE_SOURCE':
      newState.recipe = { ...state.recipe, source: action.newSource };
      break;

    case 'ADD_STEP':
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

    case 'REMOVE_STEP':
      newState.recipe = {
        ...state.recipe,
        steps: state.recipe.steps.filter((_step: RecipeStep, index: number) => index !== action.stepIndex),
      };
      break;

    case 'ADD_INGREDIENT_TO_STEP':
      const selectedIngredient = (state.ingredientSuggestions[action.stepIndex] || []).find(
        (ingredientSuggestion: ValidIngredient) => ingredientSuggestion.name === action.ingredientName,
      );

      if (!selectedIngredient) {
        console.error("couldn't find ingredient to add");
        break;
      }

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
                      optionIndex: 0,
                    }),
                  ],
                }
              : step;
          }),
        },
      };
      break;

    case 'REMOVE_INGREDIENT_FROM_STEP':
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
            return index === action.stepIndex
              ? {
                  ...step,
                  ingredients: step.ingredients.filter(
                    (_ingredient: RecipeStepIngredient, index: number) => index !== action.ingredientIndex,
                  ),
                  products:
                    step.products.length > 1 && step.preparation.pastTense.trim().length > 0
                      ? step.products
                      : [
                          new RecipeStepProduct({
                            name: `${step.preparation.pastTense} ${step.ingredients
                              .map((ingredient: RecipeStepIngredient) => ingredient.name)
                              .join(', ')}`,
                          }),
                        ],
                }
              : step;
          }),
        },
      };
      break;

    case 'ADD_INSTRUMENT_TO_STEP':
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
            if (index === action.stepIndex) {
              return { ...step, instruments: [...step.instruments, new RecipeStepInstrument()] };
            } else {
              return step;
            }
          }),
        },
      };
      break;

    case 'REMOVE_INSTRUMENT_FROM_STEP':
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            if (stepIndex === action.stepIndex) {
              return {
                ...step,
                instruments: step.instruments.filter(
                  (_instrument: RecipeStepInstrument, instrumentIndex: number) =>
                    instrumentIndex !== action.instrumentIndex,
                ),
              };
            } else {
              return step;
            }
          }),
        },
      };
      break;

    case 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS':
      newState.ingredientSuggestions = state.ingredientSuggestions.map(
        (ingredientSuggestionsForStepIngredientSlot: ValidIngredient[], stepIndex: number) => {
          return action.stepIndex !== stepIndex ? ingredientSuggestionsForStepIngredientSlot : action.results || [];
        },
      );
      break;

    case 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS':
      newState.instrumentSuggestions = state.instrumentSuggestions.map(
        (instrumentSuggestionsForStep: ValidPreparationInstrument[], stepIndex: number) => {
          return action.stepIndex !== stepIndex ? instrumentSuggestionsForStep : action.results || [];
        },
      );
      break;

    case 'UPDATE_STEP_PREPARATION_QUERY':
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

    case 'UPDATE_STEP_PREPARATION_QUERY_RESULTS':
      newState.preparationSuggestions = state.preparationSuggestions.map(
        (preparationSuggestionsForStep: ValidPreparation[], stepIndex: number) => {
          return action.stepIndex !== stepIndex ? preparationSuggestionsForStep : action.results || [];
        },
      );
      break;

    case 'UPDATE_STEP_PREPARATION':
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

    case 'UPDATE_STEP_NOTES':
      newState.recipe = {
        ...state.recipe,
        steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
          return index !== action.stepIndex ? step : { ...step, notes: action.newDescription };
        }),
      };
      break;

    case 'UPDATE_STEP_INGREDIENT_QUERY':
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

    default:
      console.error(`Unhandled action type`);
      break;
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

  const [pageState, dispatchRecipeUpdate] = useReducer(useMealCreationReducer, new RecipeCreationPageState());

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
    console.log(
      `useEffect invoked for pageState.preparationQueryToExecute: ${JSON.stringify(
        pageState.preparationQueryToExecute,
      )}`,
    );
    if (pageState.preparationQueryToExecute?.query) {
      apiClient
        .searchForValidPreparations(pageState.preparationQueryToExecute.query)
        .then((res: AxiosResponse<ValidPreparation[]>) => {
          console.log('Got results for ingredient query');
          dispatchRecipeUpdate({
            type: 'UPDATE_STEP_PREPARATION_QUERY_RESULTS',
            stepIndex: pageState.preparationQueryToExecute!.stepIndex,
            results: res.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredients: ${err}`);
        });
    }
  }, [pageState.preparationQueryToExecute]);

  useEffect(() => {
    console.log(
      `useEffect invoked for pageState.ingredientQueryToExecute: ${JSON.stringify(pageState.ingredientQueryToExecute)}`,
    );
    if (pageState.ingredientQueryToExecute?.query) {
      apiClient
        .searchForValidIngredients(pageState.ingredientQueryToExecute.query)
        .then((res: AxiosResponse<ValidIngredient[]>) => {
          console.log('Got results for ingredient query');
          dispatchRecipeUpdate({
            type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS',
            stepIndex: pageState.ingredientQueryToExecute!.stepIndex,
            results: res.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredients: ${err}`);
          dispatchRecipeUpdate({ type: 'UPDATE_SUBMISSION_ERROR', error: err.message });
        });
    }
  }, [pageState.ingredientQueryToExecute]);

  useEffect(() => {
    console.log(
      `useEffect invoked for pageState.instrumentQueryToExecute: ${JSON.stringify(pageState.instrumentQueryToExecute)}`,
    );
    if (pageState.instrumentQueryToExecute?.query) {
      apiClient
        .validPreparationInstrumentsForPreparationID(pageState.instrumentQueryToExecute.query)
        .then((res: AxiosResponse<ValidPreparationInstrumentList>) => {
          console.log('Got results for ingredient query');
          dispatchRecipeUpdate({
            type: 'UPDATE_STEP_INSTRUMENT_QUERY_RESULTS',
            stepIndex: pageState.instrumentQueryToExecute!.stepIndex,
            results: res.data.data,
          });
        })
        .catch((err: AxiosError) => {
          console.error(`Failed to get ingredients: ${err}`);
          dispatchRecipeUpdate({ type: 'UPDATE_SUBMISSION_ERROR', error: err.message });
        });
    }
  }, [pageState.instrumentQueryToExecute]);

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
                onClick={() => dispatchRecipeUpdate({ type: 'REMOVE_STEP', stepIndex: stepIndex })}
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
              <Divider label="basic information" labelPosition="center" />
              <Stack>
                <Autocomplete
                  label="Preparation"
                  required
                  value={pageState.preparationQueries[stepIndex]}
                  onChange={(value) =>
                    dispatchRecipeUpdate({
                      type: 'UPDATE_STEP_PREPARATION_QUERY',
                      stepIndex: stepIndex,
                      newQuery: value,
                    })
                  }
                  data={pageState.preparationSuggestions[stepIndex].map((x: ValidPreparation) => ({
                    value: x.name,
                    label: x.name,
                  }))}
                  onItemSubmit={(value) => {
                    dispatchRecipeUpdate({
                      type: 'UPDATE_STEP_PREPARATION',
                      stepIndex: stepIndex,
                      preparationName: value.value,
                    });
                  }}
                />
                <Textarea
                  label="Notes"
                  value={step.notes}
                  minRows={2}
                  onChange={(event) =>
                    dispatchRecipeUpdate({
                      type: 'UPDATE_STEP_NOTES',
                      stepIndex: stepIndex,
                      newDescription: event.target.value,
                    })
                  }
                ></Textarea>
              </Stack>

              <Space h="xl"></Space>

              <Divider label="uses" labelPosition="center" mb="md" />

              <Select
                label="Instruments"
                required
                disabled={pageState.instrumentSuggestions[stepIndex].length === 0}
                data={pageState.instrumentSuggestions[stepIndex].map((x: ValidPreparationInstrument) => ({
                  value: x.instrument.name,
                  label: x.instrument.name,
                }))}
              />

              <Autocomplete
                label="Ingredients"
                required
                value={pageState.ingredientQueries[stepIndex]}
                onChange={(value) =>
                  dispatchRecipeUpdate({
                    type: 'UPDATE_STEP_INGREDIENT_QUERY',
                    newQuery: value,
                    stepIndex: stepIndex,
                  })
                }
                disabled={pageState.recipe.steps[stepIndex].preparation.name.trim() === ''}
                onItemSubmit={(item: AutocompleteItem) => {
                  dispatchRecipeUpdate({
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
                    <Grid justify="space-between">
                      <Grid.Col span="auto">
                        <Center>
                          <Text mt="xl">{`${x.ingredient?.name || x.name}`}</Text>
                        </Center>
                      </Grid.Col>
                      <Grid.Col span="content" mt="md">
                        <ActionIcon
                          mt="sm"
                          variant="outline"
                          size="md"
                          aria-label="remove recipe step ingredient"
                          disabled={step.products.length <= 1}
                          onClick={() => {}}
                        >
                          <IconTrash size="md" color="darkred" />
                        </ActionIcon>
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      <Grid.Col span="content">
                        <Switch
                          mt="md"
                          size="md"
                          onLabel="ranged"
                          offLabel="simple"
                          // value={pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex]}
                        />
                      </Grid.Col>
                      <Grid.Col span="auto">
                        <NumberInput label="Quantity" maxLength={0} />
                      </Grid.Col>
                      {false && (
                        <Grid.Col span="auto">
                          <NumberInput label="Max Quantity" maxLength={0} />
                        </Grid.Col>
                      )}
                      <Grid.Col span="auto">
                        <Select label="Unit" data={[]} />
                      </Grid.Col>
                    </Grid>
                    {recipeStepIngredientIndex !== pageState.recipe.steps[stepIndex].ingredients.length - 1 && (
                      <Divider my="md" mx="sm" />
                    )}
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
                      <Autocomplete label="Unit" value={product.name} data={[]} onChange={(value) => {}} />
                    </Grid.Col>
                    <Grid.Col span="auto">
                      <TextInput label="Name" disabled value={product.name} onChange={(value) => {}} />
                    </Grid.Col>
                    <Grid.Col span="content" mt="xl">
                      <ActionIcon
                        mt={5}
                        style={{ float: 'right' }}
                        variant="outline"
                        size="md"
                        aria-label="add product"
                        disabled={step.products.length <= 1}
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
          <Grid.Col md={3} sm={12}>
            <Stack>
              <Stack>
                <TextInput
                  withAsterisk
                  label="Name"
                  value={pageState.recipe.name}
                  onChange={(event) => dispatchRecipeUpdate({ type: 'UPDATE_NAME', newName: event.target.value })}
                  mt="xs"
                />
                <TextInput
                  label="Source"
                  value={pageState.recipe.source}
                  onChange={(event) => dispatchRecipeUpdate({ type: 'UPDATE_SOURCE', newSource: event.target.value })}
                  mt="xs"
                />
                <Textarea
                  label="Description"
                  value={pageState.recipe.description}
                  onChange={(event) =>
                    dispatchRecipeUpdate({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value })
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
                    onClick={() => dispatchRecipeUpdate({ type: 'TOGGLE_SHOW_ALL_INGREDIENTS' })}
                  >
                    {(pageState.showIngredientsSummary && (
                      <IconFoldUp size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
                    )) || <IconFoldDown size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />}
                  </ActionIcon>
                </Grid.Col>
              </Grid>
              <Divider />
              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showIngredientsSummary}>
                <Box></Box>
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
                    onClick={() => dispatchRecipeUpdate({ type: 'TOGGLE_SHOW_ALL_INSTRUMENTS' })}
                  >
                    {(pageState.showInstrumentsSummary && (
                      <IconFoldUp size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />
                    )) || <IconFoldDown size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'darkred'} />}
                  </ActionIcon>
                </Grid.Col>
              </Grid>
              <Divider />
              <Collapse sx={{ minHeight: '10rem' }} in={pageState.showInstrumentsSummary}>
                <Box></Box>
              </Collapse>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto" mt={'2.2rem'} mb="xl">
            {steps}
            <Button fullWidth onClick={() => dispatchRecipeUpdate({ type: 'ADD_STEP' })} mb="xl">
              Add Step
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}

export default RecipesPage;
