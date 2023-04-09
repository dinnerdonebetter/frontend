import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Title, SimpleGrid, Grid, Center, Button, Divider, Card, Stack } from '@mantine/core';
import Link from 'next/link';
import { ReactNode } from 'react';
import { format } from 'date-fns';

import { MealPlan, MealPlanEvent, MealPlanGroceryListItem, MealPlanOption } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { serverSideAnalytics } from '../../src/analytics';
import { extractUserInfoFromCookie } from '../../src/auth';

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

const dateFormat = 'h aa M/d/yy';

const buildEventElement = (
  includeVoteButton: boolean = true,
): ((_event: MealPlanEvent, _eventIndex: number) => ReactNode) => {
  return (event: MealPlanEvent, _eventIndex: number): ReactNode => {
    return (
      <Card shadow="xs" radius="md" withBorder my="xl">
        <Grid justify="center" align="center">
          <Grid.Col span={6}>
            <Title order={4}>{format(new Date(event.startsAt), dateFormat)}</Title>
          </Grid.Col>
          <Grid.Col span={6}>{includeVoteButton && <Button sx={{ float: 'right' }}>Submit Vote</Button>}</Grid.Col>
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
};

function MealPlanPage({ mealPlan }: MealPlanPageProps) {
  const earliestEvent = mealPlan.events.reduce((earliest: MealPlanEvent, event: MealPlanEvent) => {
    return event.startsAt < earliest.startsAt ? event : earliest;
  });

  const latestEvent = mealPlan.events.reduce((earliest: MealPlanEvent, event: MealPlanEvent) => {
    return event.startsAt > earliest.startsAt ? event : earliest;
  });

  const undecidedEvents = mealPlan.events.filter(
    (event: MealPlanEvent) => event.options.filter((option: MealPlanOption) => !option.chosen).length !== 0,
  );
  const decidedEvents = mealPlan.events.filter(
    (event: MealPlanEvent) => event.options.filter((option: MealPlanOption) => !option.chosen).length === 0,
  );

  return (
    <AppLayout title="Meal Plan">
      <Center>
        <Stack>
          <Center>
            <Title order={3} p={5}>
              {`${format(new Date(earliestEvent.startsAt), dateFormat)} - ${format(
                new Date(latestEvent.startsAt),
                dateFormat,
              )}`}
            </Title>
          </Center>

          <Grid>{undecidedEvents.map(buildEventElement(true))}</Grid>

          {decidedEvents.length > 0 && <Divider my="xl" label="decided" labelPosition="center" />}
        </Stack>
      </Center>
    </AppLayout>
  );
}

export default MealPlanPage;
