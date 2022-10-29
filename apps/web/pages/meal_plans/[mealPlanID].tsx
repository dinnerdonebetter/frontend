import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Title, Text, SimpleGrid, Grid } from '@mantine/core';

import { MealPlan, MealPlanEvent, MealPlanOption } from 'models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import Link from 'next/link';

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

const findChosenMealPlanOptions = (mealPlan: MealPlan): MealPlanOption[] => {
  const retVal: MealPlanOption[] = [];

  (mealPlan.events || []).forEach((mealPlanEvent: MealPlanEvent) => {
    return (mealPlanEvent.options || []).forEach((option: MealPlanOption) => {
      if (option.chosen) {
        retVal.push(option);
      }
    });
  });

  return retVal;
};

function MealPlanPage({ mealPlan }: MealPlanPageProps) {
  const chosenOptionsList = findChosenMealPlanOptions(mealPlan).map((option: MealPlanOption) => {
    return <Link href={`/meals/${option.meal.id}`}>{option.meal.name}</Link>;
  });

  return (
    <AppLayout>
      <Title order={3}>{mealPlan.id}</Title>
      <Grid>
        <Grid.Col span="auto">span=auto</Grid.Col>
        <Grid.Col span={6}>
          <SimpleGrid>{chosenOptionsList}</SimpleGrid>
        </Grid.Col>
        <Grid.Col span="auto">span=auto</Grid.Col>
      </Grid>
    </AppLayout>
  );
}

export default MealPlanPage;
