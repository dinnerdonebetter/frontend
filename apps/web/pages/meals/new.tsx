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
import { AxiosResponse } from 'axios';
import {
  ALL_MEAL_COMPONENT_TYPES,
  Meal,
  MealComponent,
  MealComponentType,
  Recipe,
  RecipeList,
} from '@prixfixeco/models';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { buildLocalClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { IconAlertCircle, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';

const mealSubmissionShouldBeDisabled = (meal: Meal): boolean => {
  const componentProblems: string[] = [];

  meal.components.forEach((component: MealComponent, index: number) => {
    if (!component.componentType || component.componentType === 'unspecified') {
      componentProblems.push(`Component ${index + 1} is missing a component type`);
    }
  });

  return !(meal.name.length > 0 && meal.components.length > 0 && componentProblems.length === 0);
};

export default function NewMealPage(): JSX.Element {
  const router = useRouter();
  const [meal, setMeal] = useState(new Meal());
  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipeSuggestions, setRecipeSuggestions] = useState(new Array<Recipe>());
  const [submissionError, setSubmissionError] = useState('');
  const [submissionShouldBePrevented, setSubmissionShouldBePrevented] = useState(true);

  const apiClient = buildLocalClient();

  useEffect(() => {
    const trimmedRecipeQuery = recipeQuery.trim();
    console.log(`Querying for recipes with name: ${recipeQuery}`);
    if (trimmedRecipeQuery.length > 2) {
      apiClient.searchForRecipes(trimmedRecipeQuery).then((res: AxiosResponse<RecipeList>) => {
        setRecipeSuggestions(res.data?.data || []);
      });
    } else {
      setRecipeSuggestions([] as Recipe[]);
    }
  }, [recipeQuery]);

  useEffect(() => {
    setSubmissionShouldBePrevented(mealSubmissionShouldBeDisabled(meal));
  }, [meal]);

  const selectRecipe = (item: AutocompleteItem) => {
    const selectedRecipe = recipeSuggestions.find(
      (x: Recipe) =>
        x.name === item.value && !meal.components.find((y: MealComponent) => y.recipe.id === x.id),
    );

    if (selectedRecipe) {
      setMeal({ ...meal, components: [...meal.components, new MealComponent({ recipe: selectedRecipe })] });
      setRecipeQuery('');
      setRecipeSuggestions([]);
    }
  };

  const submitMeal = async () => {
    apiClient
      .createMeal(Meal.toCreationRequestInput(meal))
      .then((res: AxiosResponse<Meal>) => {
        router.push(`/meals/${res.data.id}`);
      })
      .catch((err) => {
        setSubmissionError(err.message);
        console.error(`Failed to create meal: ${err}`);
      });
  };

  let chosenRecipes = (meal.components || []).map((mealComponent: MealComponent, componentIndex: number) => (
    <List.Item key={mealComponent.recipe.id} icon={<></>} pt="xs">
      <Grid>
        <Grid.Col span="auto" mt={-25}>
          <Select
            label="Component Type"
            placeholder="Type"
            value={mealComponent.componentType}
            onChange={(value: MealComponentType) => {
              let newComponents = [...meal.components];
              newComponents[componentIndex].componentType = value;

              setMeal({ ...meal, components: newComponents });
            }}
            data={ALL_MEAL_COMPONENT_TYPES.filter((x) => x != 'unspecified').map((x) => ({ label: x, value: x }))}
          />
        </Grid.Col>
        <Grid.Col span="auto" mt={5}>
          {mealComponent.recipe.name}
        </Grid.Col>
        <Grid.Col span={1}>
          <ActionIcon
            onClick={() => setMeal({ ...meal, components: meal.components.filter((x) => x.recipe.id !== mealComponent.recipe.id) })}
            sx={{ float: 'right' }}
            aria-label="remove recipe from meal"
          >
            <IconX color="red" />
          </ActionIcon>
        </Grid.Col>
      </Grid>
    </List.Item>
  ));

  return (
    <AppLayout>
      <Head>
        <title>Prixfixe - New Meal</title>
      </Head>
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
            value={meal.name}
            onChange={(event) => setMeal({ ...meal, name: event.target.value })}
            mt="xs"
          />
          <TextInput
            label="Description"
            value={meal.description}
            onChange={(event) => setMeal({ ...meal, description: event.target.value })}
            mt="xs"
          />

          <Space h="lg" />
          <Divider />

          <Autocomplete
            value={recipeQuery}
            onChange={(value: string) => setRecipeQuery(value)}
            limit={20}
            label="Recipe name"
            placeholder="baba ganoush"
            onItemSubmit={selectRecipe}
            data={recipeSuggestions.map((x: Recipe) => ({ value: x.name, label: x.name }))}
            mt="xs"
          />
          <Space h="md" />

          <List>{chosenRecipes}</List>

          <Space h="md" />
          {submissionError && (
            <Alert m="md" icon={<IconAlertCircle size={16} />} color="red">
              {submissionError}
            </Alert>
          )}

          <Group position="center">
            <Button type="submit" disabled={submissionShouldBePrevented}>
              Submit
            </Button>
          </Group>
        </form>
      </Container>
    </AppLayout>
  );
}
