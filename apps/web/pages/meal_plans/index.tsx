import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import NextLink from 'next/link';
import { Link } from '@geist-ui/core';

import { MealPlan } from 'models';

import { buildServerSideClient } from '../../client';

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
    <li key={mealPlan.id}>
      <NextLink href={`/meal_plans/${mealPlan.id}`}>
        <Link block>{mealPlan.id}</Link>
      </NextLink>
    </li>
  ));

  return <>{mealPlanItems}</>;
}

export default MealPlansPage;
