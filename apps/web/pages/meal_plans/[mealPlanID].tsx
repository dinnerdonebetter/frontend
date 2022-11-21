import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Title, SimpleGrid, Grid, Center } from '@mantine/core';
import Link from 'next/link';

import { MealPlan, MealPlanEvent, MealPlanGroceryListItem, MealPlanOption } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlanPageProps>> => {
  const span = serverSideTracer.startSpan('MealPlanPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { mealPlanID } = context.query;
  if (!mealPlanID) {
    throw new Error('meal plan ID is somehow missing!');
  }

  const { data: mealPlan } = await pfClient.getMealPlan(mealPlanID.toString()).then((result) => {
    span.addEvent('meal plan retrieved');
    return result;
  });

  const { data: groceryList } = await pfClient.getMealPlanGroceryListItems(mealPlanID.toString()).then((result) => {
    span.addEvent('meal plan grocery list items retrieved');
    return result;
  });

  span.end();
  return { props: { mealPlan, groceryList: groceryList || [] } };
};

declare interface MealPlanPageProps {
  mealPlan: MealPlan;
  groceryList: MealPlanGroceryListItem[];
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

function MealPlanPage({ mealPlan, groceryList }: MealPlanPageProps) {
  const chosenOptionsList = findChosenMealPlanOptions(mealPlan).map((option: MealPlanOption) => {
    return (
      <Link key={option.meal.id} href={`/meals/${option.meal.id}`}>
        {option.meal.name}
      </Link>
    );
  });

  console.dir(groceryList);

  return (
    <AppLayout title='Meal Plan'>
      <Center p={5}>
        <Title order={3}>{mealPlan.id}</Title>
      </Center>
      <Grid>
        <Grid.Col span="auto">{/*  */}</Grid.Col>
        <Grid.Col span={9}>
          <Center>
            <SimpleGrid>{chosenOptionsList}</SimpleGrid>
          </Center>
        </Grid.Col>
        <Grid.Col span="auto">{/*  */}</Grid.Col>
      </Grid>
    </AppLayout>
  );
}

export default MealPlanPage;
