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
  List,
  Autocomplete,
  Group,
  AutocompleteItem,
  Box,
  ScrollArea,
  Container,
  NumberInput,
  Select,
  Checkbox,
  Switch,
} from '@mantine/core';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconCircleMinus, IconPlus, IconTrash } from '@tabler/icons';
import { Reducer, useEffect, useReducer, useRef } from 'react';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  RecipeStepProduct,
  ValidIngredient,
  ValidInstrument,
  ValidPreparation,
} from '@prixfixeco/models';

import { AppLayout } from '../../lib/layouts';
import { buildLocalClient } from '../../lib/client';

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
  | { type: 'UPDATE_STEP_INSTRUMENT_QUERY'; stepIndex: number; newQuery: string }
  | {
      type: 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS';
      stepIndex: number;
      results: ValidIngredient[];
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
  instrumentQueries: string[] = [''];
  instrumentQueryToExecute: queryUpdateData | null = null;
  instrumentSuggestions: ValidInstrument[][] = [[]];
}

const useMealCreationReducer: Reducer<RecipeCreationPageState, RecipeCreationAction> = (
  state: RecipeCreationPageState,
  action: RecipeCreationAction,
): RecipeCreationPageState => {
  // console.debug(`[useMealCreationReducer] action: ${JSON.stringify(action)}`);

  let newState: RecipeCreationPageState = { ...state };

  switch (action.type) {
    case 'UPDATE_SUBMISSION_ERROR':
      newState = {
        ...state,
        submissionError: action.error,
      };
      break;

    case 'UPDATE_NAME':
      newState = {
        ...state,
        recipe: { ...state.recipe, name: action.newName },
        submissionShouldBePrevented: recipeSubmissionShouldBeDisabled(state),
      };
      break;

    case 'UPDATE_DESCRIPTION':
      newState = { ...state, recipe: { ...state.recipe, description: action.newDescription } };
      break;

    case 'UPDATE_SOURCE':
      newState = { ...state, recipe: { ...state.recipe, source: action.newSource } };
      break;

    case 'ADD_STEP':
      newState = {
        ...state,
        ingredientQueries: [...state.ingredientQueries, ''],
        ingredientSuggestions: [...state.ingredientSuggestions, []],
        preparationQueries: [...state.preparationQueries, ''],
        preparationSuggestions: [...state.preparationSuggestions, []],
        instrumentQueries: [...state.instrumentQueries, ''],
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
      newState = {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.filter((_step: RecipeStep, index: number) => index !== action.stepIndex),
        },
      };
      break;

    case 'ADD_INGREDIENT_TO_STEP':
      const selectedIngredient = state.ingredientSuggestions[action.stepIndex].find(
        (ingredientSuggestion: ValidIngredient) => ingredientSuggestion.name === action.ingredientName,
      );

      if (!selectedIngredient) {
        console.error("couldn't find ingredient to add");
        break;
      }

      newState = {
        ...state,
        ingredientQueries: state.ingredientQueries.map((query: string, stepIndex: number) => {
          return stepIndex === action.stepIndex ? '' : query;
        }),
        ingredientSuggestions: state.ingredientSuggestions.map((suggestions: ValidIngredient[], stepIndex: number) => {
          return stepIndex === action.stepIndex ? [] : suggestions;
        }),
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

    case 'UPDATE_STEP_INSTRUMENT_QUERY':
      newState = {
        ...state,
        instrumentQueries: state.instrumentQueries.map((instrumentQueriesForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? instrumentQueriesForStep : action.newQuery;
        }),
      };
      break;

    case 'UPDATE_STEP_INGREDIENT_QUERY_RESULTS':
      newState = {
        ...state,
        ingredientSuggestions: state.ingredientSuggestions.map(
          (ingredientSuggestionsForStepIngredientSlot: ValidIngredient[], stepIndex: number) => {
            return action.stepIndex !== stepIndex ? ingredientSuggestionsForStepIngredientSlot : action.results;
          },
        ),
      };
      break;

    case 'UPDATE_STEP_PREPARATION_QUERY':
      newState = {
        ...state,
        preparationQueries: state.preparationQueries.map((preparationQueryForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? preparationQueryForStep : action.newQuery;
        }),
      };
      break;

    case 'UPDATE_STEP_NOTES':
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

    case 'UPDATE_STEP_INSTRUMENT_QUERY':
      newState = {
        ...state,
        instrumentQueries: state.instrumentQueries.map((instrumentQueriesForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? instrumentQueriesForStep : action.newQuery;
        }),
      };
      break;

    default:
      console.error(`Unhandled action type`);
      break;
  }

  // console.debug(`[useMealCreationReducer] returned state: ${JSON.stringify(newState)}`);
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
        dispatchRecipeUpdate({ type: 'UPDATE_SUBMISSION_ERROR', error: err.message });
      });
  };

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

  const steps = pageState.recipe.steps.map((step, stepIndex) => {
    return (
      <Card key={stepIndex} shadow="sm" radius="md" withBorder sx={{ width: '100%', marginBottom: '1rem' }}>
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
                <IconCircleMinus size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'red'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <Card.Section px="xs" pb="xs">
          <Grid>
            <Grid.Col span="auto">
              <Stack>
                <Autocomplete
                  label="Preparation"
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
                />
                <Textarea
                  label="Notes"
                  value={step.notes}
                  minRows={4}
                  onChange={(event) =>
                    dispatchRecipeUpdate({
                      type: 'UPDATE_STEP_NOTES',
                      stepIndex: stepIndex,
                      newDescription: event.target.value,
                    })
                  }
                ></Textarea>
              </Stack>
            </Grid.Col>

            <Divider orientation="vertical" my="md" mx="sm" />

            <Grid.Col span="auto">
              <Group>
                <Autocomplete
                  label="Instruments"
                  value={pageState.instrumentQueries[stepIndex]}
                  onChange={(value) =>
                    dispatchRecipeUpdate({
                      type: 'UPDATE_STEP_INSTRUMENT_QUERY',
                      newQuery: value,
                      stepIndex: stepIndex,
                    })
                  }
                  data={[]}
                />
              </Group>
            </Grid.Col>
          </Grid>

          <Divider my="md" mx="sm" />

          <Grid>
            <Grid.Col span="auto">
              <Stack>
                <Autocomplete
                  label="Ingredients"
                  value={pageState.ingredientQueries[stepIndex]}
                  onChange={(value) =>
                    dispatchRecipeUpdate({
                      type: 'UPDATE_STEP_INGREDIENT_QUERY',
                      newQuery: value,
                      stepIndex: stepIndex,
                    })
                  }
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
                    <>
                      <Grid key={recipeStepIngredientIndex}>
                        <Grid.Col span="auto">
                          <Text mt="xl">{x.name}</Text>
                        </Grid.Col>
                        <Grid.Col span="content">
                          <Switch
                            mt="md"
                            size="md"
                            onLabel="ranged"
                            offLabel="simple"
                            value={pageState.ingredientIsRanged[stepIndex][recipeStepIngredientIndex]}
                          />
                        </Grid.Col>
                        <Grid.Col span="auto">
                          <NumberInput label="Quantity" maxLength={0} />
                        </Grid.Col>
                        {false && (
                          <Grid.Col span="auto">
                            <NumberInput label="Quantity" maxLength={0} />
                          </Grid.Col>
                        )}
                        <Grid.Col span="auto">
                          <Select label="Unit" data={[]} />
                        </Grid.Col>
                        <Grid.Col span="content" mt="md">
                          <ActionIcon
                            mt="sm"
                            variant="outline"
                            size="md"
                            aria-label="add product"
                            disabled={step.products.length <= 1}
                            // onClick={() =>
                            //   dispatchRecipeUpdate({
                            //     type: 'REMOVE_INGREDIENT_FROM_STEP',
                            //     stepIndex: stepIndex,
                            //   })
                            // }
                          >
                            <IconTrash size="md" color="darkred" />
                          </ActionIcon>
                        </Grid.Col>
                      </Grid>
                      {recipeStepIngredientIndex !== pageState.recipe.steps[stepIndex].ingredients.length - 1 && (
                        <Divider my="md" mx="sm" />
                      )}
                    </>
                  ),
                )}
              </Stack>
            </Grid.Col>

            <Divider orientation="vertical" my="md" mx="sm" />

            <Grid.Col span="auto">
              {step.products.map((product, productIndex) => {
                return (
                  <Group key={productIndex}>
                    <TextInput
                      label="Products"
                      value={product.name}
                      // onChange={(value) =>
                      // dispatchRecipeUpdate({
                      //   type: 'UPDATE_STEP_INSTRUMENT_QUERY',
                      //   newQuery: value,
                      //   stepIndex: stepIndex,
                      //   instrumentIndex: instrumentIndex,
                      // })
                      // }
                    />
                    {productIndex === 0 && (
                      <ActionIcon
                        mt="xl"
                        variant="outline"
                        size="md"
                        aria-label="add product"
                        disabled={step.products.length <= 1}
                        // onClick={() =>
                        //   dispatchRecipeUpdate({
                        //     type: 'ADD_INSTRUMENT_TO_STEP',
                        //     stepIndex: stepIndex,
                        //   })
                        // }
                      >
                        <IconPlus size="md" />
                      </ActionIcon>
                    )}
                  </Group>
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
              <Divider />
              <Stack sx={{ minHeight: '10rem' }}>
                <Title order={4}>Ingredients</Title>
                {/*
                <List icon={<></>} mt={-20} spacing={-15}>
                </List>
                 */}
              </Stack>
              <Divider />
              <Stack sx={{ minHeight: '10rem' }}>
                <Title order={4}>Instruments</Title>
                {/*
                <List icon={<></>} mt={-20} spacing={-15}>
                </List>
                 */}
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto" mt={'2.2rem'}>
            {steps}
            <Button fullWidth onClick={() => dispatchRecipeUpdate({ type: 'ADD_STEP' })}>
              Add Step
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </AppLayout>
  );
}

export default RecipesPage;
