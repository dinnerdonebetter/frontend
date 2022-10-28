import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import NextLink from 'next/link';

import { Recipe } from 'models';

import { buildServerSideClient } from '../../client';
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
      <NextLink href={`/recipes/${recipe.id}`}>{recipe.name}</NextLink>
    </List.Item>
  ));

  return (
    <Container size="xs">
      <List>{recipeItems}</List>
    </Container>
  );
}

export default RecipesPage;
