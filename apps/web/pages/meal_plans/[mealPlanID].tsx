import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { MealPlan } from 'models';

import { buildServerSideClient } from '../../client';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<MealPlanPageProps>> => {
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
    <div>
      <h1>{mealPlan.id}</h1>
    </div>
  );
}

export default MealPlanPage;
