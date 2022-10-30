import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';

import { Recipe } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { Container, List } from '@mantine/core';

declare interface RecipesPageProps {
  recipes: Recipe[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipesPageProps>> => {
  const pfClient = buildServerSideClient(context);

  // TODO: parse context.query as QueryFilter.
  const { data: recipes } = await pfClient.getRecipes();

  return { props: { recipes: recipes.data } };
};

function RecipesPage(props: RecipesPageProps) {
  const { recipes } = props;

  const recipeItems = (recipes || []).map((recipe: Recipe) => (
    <List.Item key={recipe.id}>
      <Link href={`/recipes/${recipe.id}`}>{recipe.name}</Link>
    </List.Item>
  ));

  return (
    <AppLayout>
      <Container size="xs">
        <List>{recipeItems}</List>
      </Container>
    </AppLayout>
  );
}

export default RecipesPage;
