import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Container, List } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import Link from 'next/link';

import { Recipe, RecipeList } from 'models';

import { buildServerSideClient } from '../../src/client';
import { buildServerSideLogger } from '../../src/logger';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';

declare interface RecipesPageProps {
  recipes: Recipe[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipesPageProps>> => {
  const span = serverSideTracer.startSpan('RecipesPage.getInitialProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('recipes_list_route');

  // TODO: parse context.query as QueryFilter.
  var recipes: Recipe[] = [];
  let props!: GetServerSidePropsResult<RecipesPageProps>;

  await pfClient
    .getRecipes()
    .then((res: AxiosResponse<RecipeList>) => {
      recipes = res.data.data;
      props = { props: { recipes } };
    })
    .catch((error: AxiosError) => {
      logger.error(error);
      if (error.response?.status === 401) {
        props = {
          redirect: {
            destination: `/login?dest=${encodeURIComponent(context.resolvedUrl)}`,
            permanent: false,
          },
        };
      }
    });

  span.end();
  return props;
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
