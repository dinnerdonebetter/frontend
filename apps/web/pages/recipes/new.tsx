import { Container, List, Title } from '@mantine/core';
import Link from 'next/link';

import { Recipe } from '@prixfixeco/models';

import { AppLayout } from '../../src/layouts';

declare interface RecipeCreatorPageProps {
  recipes: Recipe[];
}


function RecipesPage(props: RecipeCreatorPageProps) {
  const { recipes } = props;

  const recipeItems = (recipes || []).map((recipe: Recipe) => (
    <List.Item key={recipe.id}>
      <Link href={`/recipes/${recipe.id}`}>{recipe.name}</Link>
    </List.Item>
  ));

  return (
    <AppLayout title="Create Recipe">
      <Container size="xs">
        <Title>Create Recipe</Title>
      </Container>
    </AppLayout>
  );
}

export default RecipesPage;
