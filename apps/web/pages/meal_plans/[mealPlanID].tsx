import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Title, SimpleGrid, Grid, Center, Button, Space, Divider, Card } from '@mantine/core';
import Link from 'next/link';
import { format } from 'date-fns';

import { MealPlan, MealPlanEvent, MealPlanGroceryListItem, MealPlanOption } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { serverSideAnalytics } from '../../src/analytics';
import { extractUserInfoFromCookie } from '../../src/auth';
import { ReactNode } from 'react';

declare interface MealPlanPageProps {
  mealPlan: MealPlan;
  groceryList: MealPlanGroceryListItem[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlanPageProps>> => {
  const span = serverSideTracer.startSpan('MealPlanPage.getServerSideProps');
  const pfClient = buildServerSideClient(context);

  const { mealPlanID } = context.query;
  if (!mealPlanID) {
    throw new Error('meal plan ID is somehow missing!');
  }

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'MEAL_PLAN_PAGE', context, {
      mealPlanID,
      householdID: userSessionData.householdID,
    });
  }

  let notFound = false;

  const mealPlan = await pfClient.getMealPlan(mealPlanID.toString()).then((result) => {
    if (result.status === 404) {
      notFound = true;
      return;
    }

    span.addEvent(`recipe retrieved`);
    return result.data;
  });

  const groceryList = await pfClient.getMealPlanGroceryListItems(mealPlanID.toString()).then((result) => {
    if (result.status === 404) {
      notFound = true;
      return;
    }

    span.addEvent('meal plan grocery list items retrieved');
    return result.data;
  });

  if (notFound || !mealPlan) {
    return {
      redirect: {
        destination: '/meal_plans',
        permanent: false,
      },
    };
  }

  span.end();
  return { props: { mealPlan: mealPlan!, groceryList: groceryList || [] } };
};

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

const dateFormat = 'h aa M/d/yy';

function MealPlanPage({ mealPlan, groceryList }: MealPlanPageProps) {
  const availableOptionsList = mealPlan.events.map((event: MealPlanEvent, _eventIndex: number) => {
    return event.options.map((option: MealPlanOption, _optionIndex: number) => {
      return (
        <Link key={option.meal.id} href={`/meals/${option.meal.id}`}>
          {option.meal.name}
        </Link>
      );
    });
  });

  const chosenOptionsList = findChosenMealPlanOptions(mealPlan).map((option: MealPlanOption) => {
    return (
      <Link key={option.meal.id} href={`/meals/${option.meal.id}`}>
        {option.meal.name}
      </Link>
    );
  });

  const buildEventElement = (event: MealPlanEvent, _eventIndex: number): ReactNode => {
    return (
      <Card shadow="xs" radius="md" withBorder my="xl">
        <Grid justify="center" align="center">
          <Grid.Col span={6}>
            <Title order={4}>{format(new Date(event.startsAt), dateFormat)}</Title>
          </Grid.Col>
          <Grid.Col span={6}>
            <Button sx={{ float: 'right' }}>Submit Vote</Button>
          </Grid.Col>
        </Grid>
        {event.options.map((option: MealPlanOption, _optionIndex: number) => {
          return (
            <Card shadow="xs" radius="md" withBorder mt="xs">
              <SimpleGrid>
                <Link key={option.meal.id} href={`/meals/${option.meal.id}`}>
                  {option.meal.name}
                </Link>
              </SimpleGrid>
            </Card>
          );
        })}
      </Card>
    );
  };

  const earliestEvent = mealPlan.events.reduce((earliest, event) => {
    if (event.startsAt < earliest.startsAt) {
      return event;
    }
    return earliest;
  });
  const latestEvent = mealPlan.events.reduce((earliest, event) => {
    if (event.startsAt > earliest.startsAt) {
      return event;
    }
    return earliest;
  });

  return (
    <AppLayout title="Meal Plan">
      <Center p={5}>
        <Title order={3}>
          {format(new Date(earliestEvent.startsAt), dateFormat)} - {format(new Date(latestEvent.startsAt), dateFormat)}
        </Title>
      </Center>

      <Grid>{mealPlan.events.map(buildEventElement)}</Grid>

      <Divider my="xl" />

      <Grid>
        <Grid.Col span="auto">
          <SimpleGrid>{chosenOptionsList}</SimpleGrid>
        </Grid.Col>
      </Grid>

      <Space h="xl" />
    </AppLayout>
  );
}

export default MealPlanPage;
