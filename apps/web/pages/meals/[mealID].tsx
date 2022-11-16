import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Card, Container, Grid, List, Title } from '@mantine/core';
import { ReactNode } from 'react';
import Head from 'next/head';

import { Meal, MealRecipe } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import Link from 'next/link';
import { serverSideTracer } from '../../src/tracer';

declare interface MealPageProps {
  meal: Meal;
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPageProps>> => {
  const span = serverSideTracer.startSpan('MealPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { mealID } = context.query;
  if (!mealID) {
    throw new Error('meal ID is somehow missing!');
  }

  const { data: meal } = await pfClient.getMeal(mealID.toString()).then((result) => {
    span.addEvent('meal retrieved');
    return result;
  });

  span.end();
  return { props: { meal } };
};

const formatRecipeList = (meal: Meal): ReactNode => {
  return (meal.components || []).map((mr: MealRecipe, index: number) => {
    return (
      <List.Item key={index}>
        <Link href={`/recipes/${mr.recipe.id}`}>{mr.recipe.name}</Link>
      </List.Item>
    );
  });
};

function MealPage({ meal }: MealPageProps) {
  return (
    <AppLayout>
      <Head>
        <title>Prixfixe - {meal.name}</title>
      </Head>
      <Container size="xs">
        <Title order={3}>{meal.name}</Title>
        <Grid grow gutter="md">
          <Card shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
            <Title order={5}>Recipes</Title>
            <List>{formatRecipeList(meal)}</List>
          </Card>
        </Grid>
      </Container>
    </AppLayout>
  );
}

export default MealPage;
