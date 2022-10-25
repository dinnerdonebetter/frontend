import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import NextLink from 'next/link'
import { Link } from '@geist-ui/core';

import { Recipe } from 'models';

import { buildServerSideClient } from '../../client';

declare interface RecipesPageProps {
  recipes: Recipe[];
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<RecipesPageProps>> => {
  const pfClient = buildServerSideClient(context);

  // TODO: parse context.query as QueryFilter.
  const { data: recipes } = await pfClient.getRecipes();

  return { props: { recipes: recipes.data } };
};


function RecipesPage(props: RecipesPageProps) {
  const {recipes} = props;

  const recipeItems = (recipes || []).map((recipe: Recipe) =>
      <li key={recipe.id}>
        <NextLink href={`/recipes/${ recipe.id }`}>
          <Link block>{ recipe.name }</Link>
        </NextLink>
      </li>
  )

  return (
    <>
      {recipeItems}
    </>
  );
}

export default RecipesPage;
