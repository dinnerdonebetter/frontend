import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Center, Container, List } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import Link from 'next/link';

import { QueryFilter, Recipe, RecipeList } from '@prixfixeco/models';

import { buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { serverSideTracer } from '../../lib/tracer';
import { buildServerSideLogger } from '../../lib/logger';
import router from 'next/router';

declare interface RecipesPageProps {
  recipes: Recipe[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipesPageProps>> => {
  const span = serverSideTracer.startSpan('RecipesPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);
  const logger = buildServerSideLogger('RecipesPage');

  // TODO: parse context.query as QueryFilter.
  let props!: GetServerSidePropsResult<RecipesPageProps>;

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  await pfClient
    .getRecipes(qf)
    .then((res: AxiosResponse<RecipeList>) => {
      span.addEvent('recipes retrieved');
      const recipes = res.data.data;
      props = { props: { recipes } };
    })
    .catch((error: AxiosError) => {
      span.addEvent('error occurred');
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
    <AppLayout title="Recipes">
      <Center>
        <Button
          my="lg"
          onClick={() => {
            router.push('/recipes/new');
          }}
        >
          New Recipe
        </Button>
      </Center>
      <Container size="xs">
        <List>{recipeItems}</List>
      </Container>
    </AppLayout>
  );
}

export default RecipesPage;
