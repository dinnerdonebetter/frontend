import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import NextLink from 'next/link';

import { MealPlan } from 'models';

import { buildServerSideClient } from '../../client';
import { Container, List } from '@mantine/core';

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
    <Container size="xs">
      <List>{mealPlanItems}</List>
    </Container>
  );
}

export default MealPlansPage;
