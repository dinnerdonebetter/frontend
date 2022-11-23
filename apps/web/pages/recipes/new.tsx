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
} from '@mantine/core';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconCircleMinus, IconPlus, IconTrash } from '@tabler/icons';
import { Reducer, useReducer } from 'react';

import {
  Recipe,
  RecipeStep,
  RecipeStepIngredient,
  RecipeStepInstrument,
  ValidIngredient,
  ValidInstrument,
  ValidPreparation,
} from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { buildLocalClient } from '../../src/client';

/* BEGIN Recipe Creation Reducer */

export class RecipeCreationPageState {
  submissionShouldBePrevented: boolean = true;
  recipe: Recipe = buildInitialRecipe();
  ingredientQueries: string[][] = [['']];
  ingredientSuggestions: ValidIngredient[][] = [[]];
  instrumentQueries: string[][] = [['']];
  instrumentSuggestions: ValidInstrument[][] = [[]];
  preparationQueries: string[] = [''];
  preparationSuggestions: ValidPreparation[][] = [[]];
  submissionError: string | null = null;
}

const recipeSubmissionShouldBeDisabled = (pageState: RecipeCreationPageState): boolean => {
  const componentProblems: string[] = [];

  return !(pageState.recipe.name.length > 0 && pageState.recipe.steps.length > 0 && componentProblems.length === 0);
};

const buildInitialRecipe = (): Recipe => {
  return new Recipe({
    steps: [
      new RecipeStep({
        instruments: [new RecipeStepInstrument()],
        ingredients: [new RecipeStepIngredient()],
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
  | { type: 'ADD_INGREDIENT_TO_STEP'; stepIndex: number }
  | { type: 'ADD_INSTRUMENT_TO_STEP'; stepIndex: number }
  | { type: 'REMOVE_INGREDIENT_FROM_STEP'; stepIndex: number; ingredientIndex: number }
  | { type: 'REMOVE_INSTRUMENT_FROM_STEP'; stepIndex: number; instrumentIndex: number }
  | { type: 'UPDATE_STEP_PREPARATION_QUERY'; stepIndex: number; newQuery: string }
  | { type: 'UPDATE_STEP_NOTES'; stepIndex: number; newDescription: string }
  | { type: 'UPDATE_STEP_INGREDIENT_QUERY'; stepIndex: number; ingredientIndex: number; newQuery: string }
  | { type: 'UPDATE_STEP_INSTRUMENT_QUERY'; stepIndex: number; instrumentIndex: number; newQuery: string };

const useMealCreationReducer: Reducer<RecipeCreationPageState, RecipeCreationAction> = (
  state: RecipeCreationPageState,
  action: RecipeCreationAction,
): RecipeCreationPageState => {
  switch (action.type) {
    case 'UPDATE_SUBMISSION_ERROR':
      return {
        ...state,
        submissionError: action.error,
      };

    case 'UPDATE_NAME':
      return {
        ...state,
        recipe: { ...state.recipe, name: action.newName },
        submissionShouldBePrevented: recipeSubmissionShouldBeDisabled(state),
      };

    case 'UPDATE_DESCRIPTION':
      return { ...state, recipe: { ...state.recipe, description: action.newDescription } };

    case 'UPDATE_SOURCE':
      return { ...state, recipe: { ...state.recipe, source: action.newSource } };

    case 'ADD_STEP':
      return {
        ...state,
        recipe: { ...state.recipe, steps: [...state.recipe.steps, new RecipeStep()] },
      };

    case 'REMOVE_STEP':
      return {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.filter((step: RecipeStep, index: number) => index !== action.stepIndex),
        },
      };

    case 'ADD_INGREDIENT_TO_STEP':
      return {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
            if (index === action.stepIndex) {
              return { ...step, ingredients: [...step.ingredients, new RecipeStepIngredient()] };
            } else {
              return step;
            }
          }),
        },
      };

    case 'REMOVE_INGREDIENT_FROM_STEP':
      return {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
            if (index === action.stepIndex) {
              return {
                ...step,
                ingredients: step.ingredients.filter(
                  (ingredient: RecipeStepIngredient, index: number) => index !== action.ingredientIndex,
                ),
              };
            } else {
              return step;
            }
          }),
        },
      };

    case 'ADD_INSTRUMENT_TO_STEP':
      return {
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

    case 'REMOVE_INSTRUMENT_FROM_STEP':
      return {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, stepIndex: number) => {
            if (stepIndex === action.stepIndex) {
              return {
                ...step,
                instruments: step.instruments.filter(
                  (instrument: RecipeStepInstrument, instrumentIndex: number) =>
                    instrumentIndex !== action.instrumentIndex,
                ),
              };
            } else {
              return step;
            }
          }),
        },
      };

    case 'UPDATE_STEP_INSTRUMENT_QUERY':
      return {
        ...state,
        instrumentQueries: state.instrumentQueries.map((instrumentQueriesForStep: string[], stepIndex: number) => {
          return stepIndex !== action.stepIndex
            ? instrumentQueriesForStep
            : instrumentQueriesForStep.map((instrumentQuery: string, instrumentIndex: number) =>
                instrumentIndex === action.instrumentIndex ? action.newQuery : instrumentQuery,
              );
        }),
      };

    case 'UPDATE_STEP_PREPARATION_QUERY':
      return {
        ...state,
        preparationQueries: state.preparationQueries.map((preparationQueryForStep: string, stepIndex: number) => {
          return stepIndex !== action.stepIndex ? preparationQueryForStep : action.newQuery;
        }),
      };

    case 'UPDATE_STEP_NOTES':
      return {
        ...state,
        recipe: {
          ...state.recipe,
          steps: state.recipe.steps.map((step: RecipeStep, index: number) => {
            return index !== action.stepIndex ? step : { ...step, notes: action.newDescription };
          }),
        },
      };

    case 'UPDATE_STEP_INGREDIENT_QUERY':
      return {
        ...state,
        ingredientQueries: state.ingredientQueries.map((ingredientQueriesForStep: string[], stepIndex: number) => {
          return stepIndex !== action.stepIndex
            ? ingredientQueriesForStep
            : ingredientQueriesForStep.map((ingredientQuery: string, ingredientIndex: number) =>
                ingredientIndex === action.ingredientIndex ? action.newQuery : ingredientQuery,
              );
        }),
      };

    case 'UPDATE_STEP_INSTRUMENT_QUERY':
      return {
        ...state,
        instrumentQueries: state.instrumentQueries.map((instrumentQueriesForStep: string[], stepIndex: number) => {
          return stepIndex !== action.stepIndex
            ? instrumentQueriesForStep
            : instrumentQueriesForStep.map((instrumentQuery: string, instrumentIndex: number) =>
                instrumentIndex === action.instrumentIndex ? action.newQuery : instrumentQuery,
              );
        }),
      };

    default:
      console.error(`Unhandled action type`);
      return state;
  }
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

  const steps = pageState.recipe.steps.map((step, stepIndex) => {
    return (
      <Card key={stepIndex} shadow="sm" radius="md" withBorder sx={{ width: '100%', marginBottom: '1rem' }}>
        <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
          <Grid justify="space-between" align="center">
            <Grid.Col span="content">
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
            <Grid.Col span="content">
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
            <Grid.Col span="content">
              <Title order={6}>Instruments</Title>
              {step.instruments.map((_instrument, instrumentIndex) => {
                return (
                  <Group key={instrumentIndex} my="xs">
                    <Autocomplete
                      value={pageState.instrumentQueries[stepIndex][instrumentIndex]}
                      onChange={(value) =>
                        dispatchRecipeUpdate({
                          type: 'UPDATE_STEP_INSTRUMENT_QUERY',
                          newQuery: value,
                          stepIndex: stepIndex,
                          instrumentIndex: instrumentIndex,
                        })
                      }
                      data={[]}
                    />
                    {(instrumentIndex === 0 && (
                      <ActionIcon
                        variant="outline"
                        size="md"
                        aria-label="remove step"
                        onClick={() =>
                          dispatchRecipeUpdate({
                            type: 'ADD_INSTRUMENT_TO_STEP',
                            stepIndex: stepIndex,
                          })
                        }
                      >
                        <IconPlus size="md" />
                      </ActionIcon>
                    )) || (
                      <ActionIcon
                        variant="outline"
                        size="md"
                        aria-label="remove step"
                        onClick={() =>
                          dispatchRecipeUpdate({
                            type: 'REMOVE_INSTRUMENT_FROM_STEP',
                            stepIndex: stepIndex,
                            instrumentIndex: instrumentIndex,
                          })
                        }
                      >
                        <IconTrash size="md" />
                      </ActionIcon>
                    )}
                  </Group>
                );
              })}
            </Grid.Col>
            <Grid.Col span="content">
              <Title order={6}>Ingredients</Title>
              {step.ingredients.map((ingredient, ingredientIndex) => {
                return (
                  <Group key={ingredientIndex} my="xs">
                    <Autocomplete
                      value={pageState.ingredientQueries[stepIndex][ingredientIndex]}
                      onChange={(value) =>
                        dispatchRecipeUpdate({
                          type: 'UPDATE_STEP_INGREDIENT_QUERY',
                          newQuery: value,
                          stepIndex: stepIndex,
                          ingredientIndex: ingredientIndex,
                        })
                      }
                      data={[]}
                    />
                    {(ingredientIndex === 0 && (
                      <ActionIcon
                        variant="outline"
                        size="md"
                        aria-label="remove step"
                        onClick={() =>
                          dispatchRecipeUpdate({
                            type: 'ADD_INGREDIENT_TO_STEP',
                            stepIndex: stepIndex,
                          })
                        }
                      >
                        <IconPlus size="md" />
                      </ActionIcon>
                    )) || (
                      <ActionIcon
                        variant="outline"
                        size="md"
                        aria-label="remove step"
                        onClick={() =>
                          dispatchRecipeUpdate({
                            type: 'REMOVE_INGREDIENT_FROM_STEP',
                            stepIndex: stepIndex,
                            ingredientIndex: ingredientIndex,
                          })
                        }
                      >
                        <IconTrash size="md" />
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
