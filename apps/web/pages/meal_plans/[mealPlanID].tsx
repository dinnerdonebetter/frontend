import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { Title, SimpleGrid, Grid, Center, Button, Divider, Card, Stack, createStyles } from '@mantine/core';
import Link from 'next/link';
import { ReactNode, Reducer, useReducer } from 'react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { Meal, MealPlan, MealPlanEvent, MealPlanGroceryListItem, MealPlanOption } from '@prixfixeco/models';

import { buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { serverSideAnalytics } from '../../src/analytics';
import { extractUserInfoFromCookie } from '../../src/auth';
import { toDAG } from '@prixfixeco/pfutils';

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

/* BEGIN Meal Plan Creation Reducer */

type mealPlanPageAction = { type: 'ADD_EVENT' };

export class MealPlanPageState {
  mealPlan: MealPlan = new MealPlan();

  constructor(mealPlan: MealPlan) {
    this.mealPlan = mealPlan;
  }
}

const useMealPlanReducer: Reducer<MealPlanPageState, mealPlanPageAction> = (
  state: MealPlanPageState,
  action: mealPlanPageAction,
): MealPlanPageState => {
  switch (action.type) {
    case 'ADD_EVENT':
      return {
        ...state,
      };

    default:
      console.error(`Unhandled action type`);
      return state;
  }
};

/* END Meal Plan Creation Reducer */

const buildEventElement = (
  includeVoteButton: boolean = true,
): ((_event: MealPlanEvent, _eventIndex: number) => ReactNode) => {
  return (event: MealPlanEvent, eventIndex: number): ReactNode => {
    return (
      <Card shadow="xs" radius="md" withBorder my="xl">
        <Grid justify="center" align="center">
          <Grid.Col span={6}>
            <Title order={4}>{format(new Date(event.startsAt), dateFormat)}</Title>
          </Grid.Col>
          <Grid.Col span={6}>{includeVoteButton && <Button sx={{ float: 'right' }}>Submit Vote</Button>}</Grid.Col>
        </Grid>
        {event.options.map((option: MealPlanOption, optionIndex: number) => {
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
  const [pageState, dispatchPageEvent] = useReducer(useMealPlanReducer, new MealPlanPageState(mealPlan));

  return (
    <AppLayout title="Meal Plan">
      <Center>
        <Stack>
          <Center>
            <Title order={3} p={5}>
              {`${format(
                new Date(
                  pageState.mealPlan.events.reduce((earliest: MealPlanEvent, event: MealPlanEvent) => {
                    return event.startsAt < earliest.startsAt ? event : earliest;
                  }).startsAt,
                ),
                dateFormat,
              )} - ${format(
                new Date(
                  pageState.mealPlan.events.reduce((earliest: MealPlanEvent, event: MealPlanEvent) => {
                    return event.startsAt > earliest.startsAt ? event : earliest;
                  }).startsAt,
                ),
                dateFormat,
              )}`}
            </Title>
          </Center>

          <Grid>
            {pageState.mealPlan.events
              .filter(
                (event: MealPlanEvent) => event.options.filter((option: MealPlanOption) => !option.chosen).length !== 0,
              )
              .map(buildEventElement(true))}
          </Grid>

          {pageState.mealPlan.events.filter(
            (event: MealPlanEvent) => event.options.filter((option: MealPlanOption) => !option.chosen).length === 0,
          ).length > 0 && <Divider my="xl" label="decided" labelPosition="center" />}
        </Stack>
      </Center>
    </AppLayout>
  );
}

export default MealPlanPage;
