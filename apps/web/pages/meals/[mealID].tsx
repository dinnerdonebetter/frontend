import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Card, Container, Grid, List, Title } from '@mantine/core';
import { ReactNode } from 'react';

import { Meal, Recipe } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPageProps>> => {
  const pfClient = buildServerSideClient(context);

  const { mealID } = context.query;
  if (!mealID) {
    throw new Error('meal ID is somehow missing!');
  }

  const { data: meal } = await pfClient.getMeal(mealID.toString());

  return { props: { meal } };
};

declare interface MealPageProps {
  meal: Meal;
}

const formatRecipeList = (meal: Meal): ReactNode => {
  return (meal.recipes || []).map((recipe: Recipe) => {
    return (
      <List.Item key={recipe.id}>
        <Link href={`/recipes/${recipe.id}`}>{recipe.name}</Link>
      </List.Item>
    );
  });
};

function MealPage({ meal }: MealPageProps) {
  return (
    <AppLayout>
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
