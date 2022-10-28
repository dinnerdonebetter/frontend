import { Autocomplete, AutocompleteItem, Button, Container, Group, List, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { AxiosResponse } from 'axios';
import { Recipe, RecipeList } from 'models';
import { useState } from 'react';

import { buildBrowserSideClient } from '../../client';

export default function NewMealPage() {
  // TODO: how do I know if a user is authenticated here?

  const apiClient = buildBrowserSideClient();

  const [selectedRecipes, setSelectedRecipes] = useState([] as Recipe[]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([] as Recipe[]);
  const [suggestedRecipeAutocompleteItems, setSuggestedRecipeAutocompleteItems] = useState([] as AutocompleteItem[]);
  const [recipeQuery, rawSetRecipeQuery] = useState('');

  const setRecipeQuery = async (value: string) => {
    rawSetRecipeQuery(value);

    if (recipeQuery.length > 2) {
      await apiClient.searchForRecipes(value).then((res: AxiosResponse<RecipeList>) => {
        setSuggestedRecipes(res.data?.data || ([] as Recipe[]));
        setSuggestedRecipeAutocompleteItems(
          suggestedRecipes.map((recipe: Recipe) => {
            return {
              label: recipe.name,
              value: recipe.name,
            };
          }),
        );
      });
    }
  };

  const selectRecipe = (item: AutocompleteItem) => {
    const suggestedRecipe = suggestedRecipes.find((x: Recipe) => x.name === item.value);
    if (suggestedRecipe) {
      setSelectedRecipes((previous) => [...previous, suggestedRecipe]);
    }

    setSuggestedRecipes([] as Recipe[]);
    console.log(`suggested recipes: ${JSON.stringify(suggestedRecipes)}`);

    setSuggestedRecipeAutocompleteItems([] as AutocompleteItem[]);
    console.log(`suggested recipe autocompletes: ${JSON.stringify(suggestedRecipeAutocompleteItems)}`);

    setRecipeQuery('');
    console.log(`recipe query: ${JSON.stringify(recipeQuery)}`);
  };

  const submitMeal = async () => {
    console.log('submitMeal invoked');
  };

  let chosenRecipes = (selectedRecipes || []).map((recipe: Recipe) => (
    <List.Item key={recipe.id}>{recipe.name}</List.Item>
  ));

  return (
    <Container size="xs">
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
  );
}
