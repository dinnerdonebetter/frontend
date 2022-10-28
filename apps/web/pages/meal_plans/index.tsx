import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import NextLink from 'next/link';
import { List } from '@mantine/core';

import { MealPlan } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

declare interface MealPlansPageProps {
  mealPlans: MealPlan[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlansPageProps>> => {
  const pfClient = buildServerSideClient(context);

  // TODO: parse context.query as QueryFilter.
  const { data: mealPlans } = await pfClient.getMealPlans();

  return { props: { mealPlans: mealPlans.data } };
};

function MealPlansPage(props: MealPlansPageProps) {
  const { mealPlans } = props;

  const mealPlanItems = (mealPlans || []).map((mealPlan: MealPlan) => (
    <List.Item key={mealPlan.id}>
      <NextLink href={`/meal_plans/${mealPlan.id}`}>{mealPlan.id}</NextLink>
    </List.Item>
  ));

  return (
    <AppLayout>
      <List>{mealPlanItems}</List>
    </AppLayout>
  );
}

export default MealPlansPage;
