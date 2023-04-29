import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Button, Center, Container, List } from '@mantine/core';
import { AxiosError, AxiosResponse } from 'axios';
import router from 'next/router';
import Link from 'next/link';

import { QueryFilter, Recipe, QueryFilteredResult } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { buildServerSideLogger } from '@prixfixeco/logger';
import { extractUserInfoFromCookie } from '../../src/auth';
import { serverSideAnalytics } from '../../src/analytics';

declare interface RecipesPageProps {
  recipes: Recipe[];
}

const logger = buildServerSideLogger('RecipesPage');

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RecipesPageProps>> => {
  const span = serverSideTracer.startSpan('RecipesPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'RECIPES_PAGE', context, {
      householdID: userSessionData.householdID,
    });
  }

  const qf = QueryFilter.deriveFromGetServerSidePropsContext(context.query);
  qf.attachToSpan(span);

  let props!: GetServerSidePropsResult<RecipesPageProps>;
  await apiClient
    .getRecipes(qf)
    .then((res: AxiosResponse<QueryFilteredResult<Recipe>>) => {
      span.addEvent('recipes retrieved');
      const recipes = res.data.data;
      props = { props: { recipes } };
    })
    .catch((error: AxiosError) => {
      span.addEvent('error occurred');
      if (error.response?.status === 401) {
        logger.error('unauthorized access to recipes page');
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
      <Container size="xs">
        <List>{recipeItems}</List>
      </Container>
    </AppLayout>
  );
}

export default RecipesPage;
