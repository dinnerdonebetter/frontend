import { Autocomplete, AutocompleteItem, Button, Container, Group, List, Title } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { Recipe, RecipeList } from '@prixfixeco/models';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useInputState } from '@mantine/hooks';

import { buildLocalClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

export default function NewMealPage(): JSX.Element {
  const [selectedRecipes, setSelectedRecipes] = useState([] as Recipe[]);
  const [recipeQuery, setRecipeQuery] = useInputState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState([] as Recipe[]);
  const [suggestedRecipeAutocompleteItems, setSuggestedRecipeAutocompleteItems] = useState([] as AutocompleteItem[]);

  useEffect(() => {
    if (recipeQuery.length > 2) {
      const apiClient = buildLocalClient();
      apiClient.searchForRecipes(recipeQuery).then((res: AxiosResponse<RecipeList>) => {
        setSuggestedRecipes(res.data?.data || ([] as Recipe[]));
      });
    }
  }, [recipeQuery]);

  useEffect(() => {
    setSuggestedRecipeAutocompleteItems(
      suggestedRecipes.map((recipe: Recipe) => {
        return {
          label: recipe.name,
          value: recipe.name,
        };
      }),
    );
  }, [suggestedRecipes]);

  useEffect(() => {
    setSuggestedRecipeAutocompleteItems([]);
    setSuggestedRecipes([]);
    setRecipeQuery('');
  }, [selectedRecipes]);

  const selectRecipe = (item: AutocompleteItem) => {
    const suggestedRecipe = suggestedRecipes.find(
      (x: Recipe) => x.name === item.value && !selectedRecipes.find((y: Recipe) => y.id === x.id),
    );

    if (suggestedRecipe) {
      setSelectedRecipes((previous) => [...previous, suggestedRecipe]);
    } else {
      setSuggestedRecipeAutocompleteItems([]);
      setSuggestedRecipes([]);
      setRecipeQuery('');
    }
  };

  const submitMeal = async () => {
    console.log('submitMeal invoked');
  };

  let chosenRecipes = (selectedRecipes || []).map((recipe: Recipe) => (
    <List.Item key={recipe.id}>{recipe.name}</List.Item>
  ));

  return (
    <AppLayout>
      <Head>
        <title>Prixfixe - New Meal</title>
      </Head>
      <Container size="xs">
        <Title order={3}>New Meal</Title>

        <List>{chosenRecipes}</List>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMeal();
          }}
        >
          <Autocomplete
            value={recipeQuery}
            onChange={setRecipeQuery}
            required
            limit={20}
            label="Recipe name"
            placeholder="baba ganoush"
            onItemSubmit={selectRecipe}
            data={suggestedRecipeAutocompleteItems}
          />

          <Group position="center">
            <Button type="submit" mt="sm">
              Submit
            </Button>
          </Group>
        </form>
      </Container>
    </AppLayout>
  );
}
