import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Card, Container, Grid, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';

import { ALL_MEAL_COMPONENT_TYPES, Meal, MealComponent } from '@prixfixeco/models';

import { buildServerSideClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import Link from 'next/link';
import { serverSideTracer } from '../../lib/tracer';

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

// https://stackoverflow.com/a/14872766
var ordering: Record<string, number> = {};
for (var i = 0; i < ALL_MEAL_COMPONENT_TYPES.length; i++) {
  ordering[ALL_MEAL_COMPONENT_TYPES[i]] = i;
}

const formatRecipeList = (meal: Meal): ReactNode => {
  const sorted = (meal.components || []).sort(function (a: MealComponent, b: MealComponent) {
    return ordering[a.componentType] - ordering[b.componentType] || a.componentType.localeCompare(b.componentType);
  });

  return sorted.map((c: MealComponent) => {
    return (
      <Card shadow="sm" p="sm" radius="md" withBorder style={{ width: '100%', margin: '1rem' }}>
        <Link href={`/recipes/${c.recipe.id}`}>{c.recipe.name}</Link>
        <Text>{c.recipe.description}</Text>
      </Card>
    );
  });
};

function MealPage({ meal }: MealPageProps) {
  return (
    <AppLayout title={meal.name}>
      <Container size="xs">
        <Title order={3}>{meal.name}</Title>
        <Title order={5} mt="sm">
          Recipes:
        </Title>
        <Grid grow gutter="md">
          {formatRecipeList(meal)}
        </Grid>
      </Container>
    </AppLayout>
  );
}

export default MealPage;
