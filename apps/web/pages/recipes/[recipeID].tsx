import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Container } from '@mantine/core';

import { Recipe } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

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
    <AppLayout>
      <h1>{recipe.name}</h1>
    </AppLayout>
  );
}

export default RecipePage;
