import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Link from 'next/link';
import { Button, Center, List } from '@mantine/core';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const { mealPlans } = props;

  const mealPlanItems = (mealPlans || []).map((mealPlan: MealPlan) => (
    <List.Item key={mealPlan.id}>
      <Link href={`/meal_plans/${mealPlan.id}`}>{mealPlan.id}</Link>
    </List.Item>
  ));

  return (
    <AppLayout>
      <Center>
        <Button
          my="lg"
          onClick={() => {
            router.push('/meal_plans/new');
          }}
        >
          New Meal Plan
        </Button>
      </Center>
      <List>{mealPlanItems}</List>
    </AppLayout>
  );
}

export default MealPlansPage;
