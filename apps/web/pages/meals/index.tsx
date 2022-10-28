import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { List } from '@mantine/core';

import { Meal } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

declare interface MealsPageProps {
  meals: Meal[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealsPageProps>> => {
  const pfClient = buildServerSideClient(context);

  // TODO: parse context.query as QueryFilter.
  const { data: meals } = await pfClient.getMeals();

  return { props: { meals: meals.data } };
};

function MealsPage(props: MealsPageProps) {
  const { meals } = props;

  const mealItems = (meals || []).map((meal: Meal) => (
    <List.Item key={meal.id}>
      <Link href={`/meals/${meal.id}`}>{meal.name}</Link>
    </List.Item>
  ));

  return (
    <AppLayout>
      <List>{mealItems}</List>
    </AppLayout>
  );
}

export default MealsPage;
