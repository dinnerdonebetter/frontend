import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { Recipe } from 'models';

import { buildServerSideClient } from '../../client';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<RecipePageProps>> => {
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
    <div>
      <h1>{recipe.name}</h1>
    </div>
  );
}

export default RecipePage;
