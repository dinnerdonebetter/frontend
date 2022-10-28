import { Autocomplete, AutocompleteItem, Button, Group, List, Title } from '@mantine/core';
import { AxiosResponse } from 'axios';
import { Recipe, RecipeList } from 'models';
import { useEffect, useState } from 'react';

import { buildBrowserSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

export default function NewMealPage() {
  // TODO: how do I know if a user is authenticated here?

  const [selectedRecipes, setSelectedRecipes] = useState([] as Recipe[]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([] as Recipe[]);
  const [suggestedRecipeAutocompleteItems, setSuggestedRecipeAutocompleteItems] = useState([] as AutocompleteItem[]);
  const [recipeQuery, setRecipeQuery] = useState('');

  useEffect(() => {
    if (recipeQuery.length > 2) {
      console.debug('querying for new recipes');

      const apiClient = buildBrowserSideClient();
      apiClient.searchForRecipes(recipeQuery).then((res: AxiosResponse<RecipeList>) => {
        setSuggestedRecipes(res.data?.data || ([] as Recipe[]));
      });

      console.debug('queried for new recipes');
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
      console.debug(`adding suggested recipe to selected recipes: ${suggestedRecipe.name}`);
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
      <Title order={3}>New Meal Plan</Title>

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
    </AppLayout>
  );
}
