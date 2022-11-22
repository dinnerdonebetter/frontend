import {
  ActionIcon,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Text,
  Space,
  Stack,
  Textarea,
  TextInput,
  Title,
  List,
  MediaQuery,
} from '@mantine/core';
import Link from 'next/link';

import { Recipe, RecipeStep, ValidIngredient, ValidInstrument, ValidPreparation } from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';
import { Reducer, useReducer } from 'react';
import { buildLocalClient } from '../../src/client';
import { AxiosResponse, AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { IconCircleMinus } from '@tabler/icons';

/* BEGIN Meal Plan Creation Reducer */

type RecipeCreationAction =
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'UPDATE_NAME'; newName: string }
  | { type: 'UPDATE_DESCRIPTION'; newDescription: string }
  | { type: 'UPDATE_SOURCE'; newSource: string }
  | { type: 'ADD_STEP' }
  | { type: 'REMOVE_STEP'; index: number };

export class RecipeCreationPageState {
  submissionShouldBePrevented: boolean = true;
  recipe: Recipe = buildInitialRecipe();
  ingredientQueries: string[][] = [['']];
  ingredientSuggestions: ValidIngredient[][] = [[]];
  instrumentQueries: string[][] = [['']];
  instrumentSuggestions: ValidInstrument[][] = [[]];
  preparationQueries: string[][] = [['']];
  preparationSuggestions: ValidPreparation[][] = [[]];
  submissionError: string | null = null;
}

const recipeSubmissionShouldBeDisabled = (pageState: RecipeCreationPageState): boolean => {
  const componentProblems: string[] = [];

  return !(pageState.recipe.name.length > 0 && pageState.recipe.steps.length > 0 && componentProblems.length === 0);
};

const buildInitialRecipe = (): Recipe => {
  return new Recipe({
    steps: [new RecipeStep()],
  });
};

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
          steps: state.recipe.steps.filter((step: RecipeStep, index: number) => index !== action.index),
        },
      };

    default:
      console.error(`Unhandled action type`);
      return state;
  }
};

/* END Meal Plan Creation Reducer */

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

  const steps = pageState.recipe.steps.map((step, index) => {
    return (
      <Card shadow="sm" radius="md" withBorder sx={{ width: '100%', marginBottom: '1rem' }}>
        <Card.Section px="xs" sx={{ cursor: 'pointer' }}>
          <Grid justify="space-between" align="center">
            <Grid.Col span="content">
              <Text weight="bold">{`Step #${index + 1}`}</Text>
            </Grid.Col>
            <Grid.Col span="auto">
              <ActionIcon
                variant="outline"
                size="sm"
                style={{ float: 'right' }}
                aria-label="remove step"
                disabled={pageState.recipe.steps.length === 1}
                onClick={() => dispatchRecipeUpdate({ type: 'REMOVE_STEP', index: index })}
              >
                <IconCircleMinus size={16} color={pageState.recipe.steps.length === 1 ? 'gray' : 'red'} />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </Card.Section>

        <TextInput label="Preparation" value={step.preparation.name} onChange={() => {}} />
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
              {/* <MediaQuery largerThan="sm" styles={{ display: 'none' }}> */}
              <Stack sx={{ minHeight: '10rem' }}>
                <Title order={4}>Ingredients</Title>
                <List icon={<></>} mt={-20} spacing={-15}>
                  {/*  */}
                </List>
              </Stack>
              <Divider />
              <Stack sx={{ minHeight: '10rem' }}>
                <Title order={4}>Instruments</Title>
                <List icon={<></>} mt={-20} spacing={-15}>
                  {/*  */}
                </List>
              </Stack>
              {/* </MediaQuery> */}
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
