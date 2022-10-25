import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import PrixFixeAPIClient from 'api-client';
import { Recipe } from 'models';

import { cookieName } from '../../constants';

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

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const pfClient = new PrixFixeAPIClient(process.env.NEXT_PUBLIC_API_ENDPOINT!, context.req.cookies[cookieName]);

  const { recipeID } = context.query;
  if (!recipeID) {
    throw new Error('recipe ID is somehow missing!');
  }

  const { data: recipe } = await pfClient.getRecipe(recipeID.toString());

  return { props: { recipe: recipe } };
};

export default RecipePage;
