import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { Meal } from 'models';

import { buildServerSideClient } from '../../client';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<MealPageProps>> => {
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

function MealPage({ meal }: MealPageProps) {
  return (
    <div>
      <h1>{meal.name}</h1>
    </div>
  );
}

export default MealPage;
