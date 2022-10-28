import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Container } from '@mantine/core';

import { Recipe } from 'models';

import { buildServerSideClient } from '../../src/client';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipePageProps>> => {
  const pfClient = buildServerSideClient(context);

  const { recipeID } = context.query;
  if (!recipeID) {
    throw new Error('recipe ID is somehow missing!');
  }

  const { data: recipe } = await pfClient.getRecipe(recipeID.toString());

  return { props: { recipe } };
};

declare interface RecipePageProps {
  recipe: Recipe;
}

function RecipePage({ recipe }: RecipePageProps) {
  return (
    <Container size="xs">
      <h1>{recipe.name}</h1>
    </Container>
  );
}

export default RecipePage;
