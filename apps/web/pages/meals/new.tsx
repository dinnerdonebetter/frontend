import {
  ActionIcon,
  Alert,
  Autocomplete,
  AutocompleteItem,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  List,
  Select,
  Space,
  TextInput,
  Title,
} from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import {
  ALL_MEAL_COMPONENT_TYPES,
  Meal,
  MealComponent,
  MealComponentType,
  Recipe,
  RecipeList,
} from '@prixfixeco/models';
import { ReactNode, Reducer, useEffect } from 'react';

import { buildLocalClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { useReducer } from 'react';
import { IconAlertCircle, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';

/* BEGIN Meal Creation Reducer */

type mealCreationReducerAction =
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'UPDATE_RECIPE_SUGGESTIONS'; recipeSuggestions: Recipe[] }
  | { type: 'UPDATE_RECIPE_QUERY'; newQuery: string }
  | { type: 'UPDATE_RECIPE_COMPONENT_TYPE'; componentIndex: number; componentType: MealComponentType }
  | { type: 'UPDATE_NAME'; newName: string }
  | { type: 'UPDATE_DESCRIPTION'; newDescription: string }
  | { type: 'ADD_RECIPE'; recipe: Recipe }
  | { type: 'REMOVE_RECIPE'; recipe: Recipe };

export class MealCreationPageState {
  meal: Meal = new Meal();
  submissionShouldBePrevented: boolean = true;
  recipeQuery: string = '';
  recipeSuggestions: Recipe[] = [];
  submissionError: string | null = null;
}

const mealSubmissionShouldBeDisabled = (pageState: MealCreationPageState): boolean => {
  const componentProblems: string[] = [];

  pageState.meal.components.forEach((component: MealComponent, index: number) => {
    if (!component.componentType || component.componentType === 'unspecified') {
      componentProblems.push(`Component ${index + 1} is missing a component type`);
    }
  });

  return !(pageState.meal.name.length > 0 && pageState.meal.components.length > 0 && componentProblems.length === 0);
};

const useMealCreationReducer: Reducer<MealCreationPageState, mealCreationReducerAction> = (
  state: MealCreationPageState,
  action: mealCreationReducerAction,
): MealCreationPageState => {
  switch (action.type) {
    case 'UPDATE_SUBMISSION_ERROR':
      return { ...state, submissionError: action.error };

    case 'UPDATE_RECIPE_QUERY':
      return { ...state, recipeQuery: action.newQuery };

    case 'UPDATE_RECIPE_SUGGESTIONS':
      return { ...state, recipeSuggestions: action.recipeSuggestions };

    case 'UPDATE_RECIPE_COMPONENT_TYPE':
      let newComponents = [...state.meal.components];
      newComponents[action.componentIndex].componentType = action.componentType;

      return {
        ...state,
        meal: { ...state.meal, components: newComponents },
        submissionShouldBePrevented: mealSubmissionShouldBeDisabled(state),
      };

    case 'UPDATE_NAME':
      return {
        ...state,
        meal: { ...state.meal, name: action.newName },
        submissionShouldBePrevented: mealSubmissionShouldBeDisabled(state),
      };

    case 'UPDATE_DESCRIPTION':
      return { ...state, meal: { ...state.meal, description: action.newDescription } };

    case 'ADD_RECIPE':
      return {
        ...state,
        recipeQuery: '',
        recipeSuggestions: [],
        meal: { ...state.meal, components: [...state.meal.components, new MealComponent({ recipe: action.recipe })] },
      };

    case 'REMOVE_RECIPE':
      return {
        ...state,
        meal: {
          ...state.meal,
          components: state.meal.components.filter((mc: MealComponent) => mc.recipe.id !== action.recipe.id),
        },
      };

    default:
      return state;
  }
};

/* END Meal Creation Reducer */

export default function NewMealPage(): JSX.Element {
  const router = useRouter();
  const [pageState, dispatchMealUpdate] = useReducer(useMealCreationReducer, new MealCreationPageState());

  useEffect(() => {
    const pfClient = buildLocalClient();
    const recipeQuery = pageState.recipeQuery.trim();
    if (recipeQuery.length > 2) {
      pfClient.searchForRecipes(recipeQuery).then((res: AxiosResponse<RecipeList>) => {
        dispatchMealUpdate({ type: 'UPDATE_RECIPE_SUGGESTIONS', recipeSuggestions: res.data?.data || [] });
      });
    } else {
      dispatchMealUpdate({ type: 'UPDATE_RECIPE_SUGGESTIONS', recipeSuggestions: [] as Recipe[] });
    }
  }, [pageState.recipeQuery]);

  const selectRecipe = (item: AutocompleteItem) => {
    const selectedRecipe = pageState.recipeSuggestions.find(
      (x: Recipe) =>
        x.name === item.value && !pageState.meal.components.find((y: MealComponent) => y.recipe.id === x.id),
    );

    if (selectedRecipe) {
      dispatchMealUpdate({ type: 'ADD_RECIPE', recipe: selectedRecipe });
    }
  };

  const removeRecipe = (recipe: Recipe) => {
    dispatchMealUpdate({ type: 'REMOVE_RECIPE', recipe: recipe });
  };

  const submitMeal = async () => {
    const pfClient = buildLocalClient();
    pfClient
      .createMeal(Meal.toCreationRequestInput(pageState.meal))
      .then((res: AxiosResponse<Meal>) => {
        router.push(`/meals/${res.data.id}`);
      })
      .catch((err: AxiosError) => {
        console.error(`Failed to create meal: ${err}`);
        dispatchMealUpdate({ type: 'UPDATE_SUBMISSION_ERROR', error: err.message });
      });
  };

  let chosenRecipes: ReactNode = (pageState.meal.components || []).map(
    (mealComponent: MealComponent, componentIndex: number) => (
      <List.Item key={mealComponent.recipe.id} icon={<></>} pt="xs">
        <Grid>
          <Grid.Col span="auto" mt={-25}>
            <Select
              label="Component Type"
              placeholder="Type"
              value={mealComponent.componentType}
              onChange={(value: MealComponentType) =>
                dispatchMealUpdate({
                  type: 'UPDATE_RECIPE_COMPONENT_TYPE',
                  componentIndex: componentIndex,
                  componentType: value,
                })
              }
              data={ALL_MEAL_COMPONENT_TYPES.filter((x) => x != 'unspecified').map((x) => ({ label: x, value: x }))}
            />
          </Grid.Col>
          <Grid.Col span="auto" mt={5}>
            {mealComponent.recipe.name}
          </Grid.Col>
          <Grid.Col span={1}>
            <ActionIcon
              onClick={() => removeRecipe(mealComponent.recipe)}
              sx={{ float: 'right' }}
              aria-label="remove recipe from meal"
            >
              <IconX color="tomato" />
            </ActionIcon>
          </Grid.Col>
        </Grid>
      </List.Item>
    ),
  );

  return (
    <AppLayout title="New Meal">
      <Container size="xs">
        <Title order={3}>Create Meal</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMeal();
          }}
        >
          <TextInput
            withAsterisk
            label="Name"
            value={pageState.meal.name}
            onChange={(event) => dispatchMealUpdate({ type: 'UPDATE_NAME', newName: event.target.value })}
            mt="xs"
          />
          <TextInput
            label="Description"
            value={pageState.meal.description}
            onChange={(event) => dispatchMealUpdate({ type: 'UPDATE_DESCRIPTION', newDescription: event.target.value })}
            mt="xs"
          />

          <Space h="lg" />
          <Divider />

          <Autocomplete
            value={pageState.recipeQuery}
            onChange={(value: string) => dispatchMealUpdate({ type: 'UPDATE_RECIPE_QUERY', newQuery: value })}
            limit={20}
            label="Recipe name"
            placeholder="baba ganoush"
            onItemSubmit={selectRecipe}
            data={pageState.recipeSuggestions.map((x: Recipe) => ({ value: x.name, label: x.name }))}
            mt="xs"
          />
          <Space h="md" />

          <List>{chosenRecipes}</List>

          <Space h="md" />
          {pageState.submissionError && (
            <Alert m="md" icon={<IconAlertCircle size={16} />} color="tomato">
              {pageState.submissionError}
            </Alert>
          )}

          <Group position="center">
            <Button type="submit" disabled={pageState.submissionShouldBePrevented}>
              Submit
            </Button>
          </Group>
        </form>
      </Container>
    </AppLayout>
  );
}
