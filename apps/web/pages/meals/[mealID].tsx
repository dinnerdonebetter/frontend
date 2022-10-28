import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Container } from '@mantine/core';

import { Meal } from 'models';

import { buildServerSideClient } from '../../client';

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

function MealPage({ meal }: MealPageProps) {
  return (
    <Container size="xs">
      <h1>{meal.name}</h1>
    </Container>
  );
}

export default MealPage;
