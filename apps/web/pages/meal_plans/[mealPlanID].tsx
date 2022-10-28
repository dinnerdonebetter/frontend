import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Title } from '@mantine/core';

import { MealPlan } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlanPageProps>> => {
  const pfClient = buildServerSideClient(context);

  const { mealPlanID } = context.query;
  if (!mealPlanID) {
    throw new Error('meal plan ID is somehow missing!');
  }

  const { data: mealPlan } = await pfClient.getMealPlan(mealPlanID.toString());

  return { props: { mealPlan } };
};

declare interface MealPlanPageProps {
  mealPlan: MealPlan;
}

function MealPlanPage({ mealPlan }: MealPlanPageProps) {
  return (
    <AppLayout>
      <Title order={3}>{mealPlan.id}</Title>
    </AppLayout>
  );
}

export default MealPlanPage;
