import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  Title,
  SimpleGrid,
  Grid,
  Center,
  Button,
  Divider,
  Card,
  Stack,
  ActionIcon,
  Indicator,
  Text,
  Checkbox,
  List,
  Space,
} from '@mantine/core';
import Link from 'next/link';
import { ReactNode, Reducer, useEffect, useReducer, useState } from 'react';
import { format } from 'date-fns';
import { IconArrowDown, IconArrowUp } from '@tabler/icons';

import {
  Household,
  HouseholdUserMembershipWithUser,
  MealPlan,
  MealPlanEvent,
  MealPlanGroceryListItem,
  MealPlanOption,
  MealPlanOptionVote,
  MealPlanOptionVoteCreationRequestInput,
  MealPlanTask,
  ValidIngredient,
} from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';
import { AxiosError, AxiosResponse } from 'axios';
import { cleanFloat } from '@prixfixeco/utils';

declare interface MealPlanPageProps {
  mealPlan: MealPlan;
  userID: string;
  household: Household;
  groceryList: MealPlanGroceryListItem[];
  tasks: MealPlanTask[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlanPageProps>> => {
  const span = serverSideTracer.startSpan('MealPlanPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

  const { mealPlanID: mealPlanIDParam } = context.query;
  if (!mealPlanIDParam) {
    throw new Error('meal plan ID is somehow missing!');
  }

  const mealPlanID = mealPlanIDParam.toString();

  const userSessionData = extractUserInfoFromCookie(context.req.cookies);
  if (userSessionData?.userID) {
    serverSideAnalytics.page(userSessionData.userID, 'MEAL_PLAN_PAGE', context, {
      mealPlanID,
      householdID: userSessionData.householdID,
    });
  }

  let notFound = false;
  let notAuthorized = false;

  const mealPlanPromise = apiClient.getMealPlan(mealPlanID).then((result) => {
    span.addEvent(`meal plan retrieved`);
    return result.data;
  });

  const householdPromise = apiClient.getCurrentHouseholdInfo().then((result) => {
    span.addEvent(`household retrieved`);
    return result.data;
  });

  // const tasksPromise = apiClient.getMealPlanTasks(mealPlanID).then((result) => {
  //   span.addEvent('meal plan grocery list items retrieved');
  //   return result.data;
  // });

  const groceryListPromise = apiClient.getMealPlanGroceryListItems(mealPlanID).then((result) => {
    span.addEvent('meal plan grocery list items retrieved');
    return result.data;
  });

  const retrievedData = await Promise.all([
    mealPlanPromise,
    householdPromise,
    groceryListPromise /*, tasksPromise */,
  ]).catch((error: AxiosError) => {
    if (error.response?.status === 404) {
      console.log(`setting notFound to true because of ${error.response?.config?.url}`);
      notFound = true;
    } else if (error.response?.status === 401) {
      console.log(`setting notAuthorized to true because of ${error.response?.config?.url}`);
      notAuthorized = true;
    } else {
      console.log(`error: ${error.response?.status} ${error.response?.config?.url}}`);
    }
  });

  if (notFound || !retrievedData) {
    console.log(`notFound: ${notFound}, !retrievedData ${!retrievedData}`);
    return {
      redirect: {
        destination: '/meal_plans',
        permanent: false,
      },
    };
  }

  if (notAuthorized) {
    console.debug(`notAuthorized: ${notAuthorized}`);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const [mealPlan, household, groceryList] = retrievedData;

  span.end();

  return {
    props: {
      mealPlan: mealPlan!,
      household: household!,
      userID: userSessionData.userID,
      tasks: [],
      groceryList: groceryList || [],
    },
  };
};

const dateFormat = "h aa 'on' iiii',' M/d";

/* BEGIN Meal Plan Creation Reducer */

type mealPlanPageAction =
  | { type: 'MOVE_OPTION'; eventIndex: number; optionIndex: number; direction: 'up' | 'down' }
  | { type: 'ADD_VOTES_TO_MEAL_PLAN'; eventIndex: number; votes: MealPlanOptionVote[] };

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
    case 'MOVE_OPTION':
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          events: (state.mealPlan.events || []).map((event: MealPlanEvent, eventIndex: number) => {
            if (
              (action.optionIndex === 0 && action.direction === 'up') ||
              (action.optionIndex === event.options.length - 1 && action.direction === 'down')
            ) {
              return event;
            }

            const options = [...event.options];
            [
              options[action.direction === 'up' ? action.optionIndex - 1 : action.optionIndex + 1],
              options[action.optionIndex],
            ] = [
              options[action.optionIndex],
              options[action.direction === 'up' ? action.optionIndex - 1 : action.optionIndex + 1],
            ];

            return eventIndex !== action.eventIndex
              ? event
              : {
                  ...event,
                  options: options,
                };
          }),
        },
      };

    case 'ADD_VOTES_TO_MEAL_PLAN':
      console.log('replacing meal plan');
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          events: (state.mealPlan.events || []).map((event: MealPlanEvent, eventIndex: number) => {
            return eventIndex !== action.eventIndex
              ? event
              : new MealPlanEvent({
                  ...event,
                  options: event.options.map((option: MealPlanOption) => {
                    const votes = (action.votes || []).filter(
                      (vote: MealPlanOptionVote) => vote.belongsToMealPlanOption === option.id,
                    );
                    return new MealPlanOption({
                      ...option,
                      votes: votes,
                    });
                  }),
                });
          }),
        },
      };

    default:
      console.error(`Unhandled action type`);
      return state;
  }
};

/* END Meal Plan Creation Reducer */

interface missingVote {
  optionID: string;
  user: string;
}

const getMissingVotersForMealPlanEvent = (
  mealPlanEvent: MealPlanEvent,
  household: Household,
  userID: string,
): Array<string> => {
  const missingVotes: Set<string> = new Set<string>();

  mealPlanEvent.options.forEach((option: MealPlanOption) => {
    household.members.forEach((member: HouseholdUserMembershipWithUser) => {
      if (
        (option.votes || []).find((vote: MealPlanOptionVote) => vote.byUser === member.belongsToUser!.id) === undefined
      ) {
        missingVotes.add(member.belongsToUser!.id !== userID ? member.belongsToUser!.username : 'you');
      }
    });
  });

  return Array.from(missingVotes.values());
};

function MealPlanPage({ mealPlan, userID, household, groceryList, tasks }: MealPlanPageProps) {
  const apiClient = buildLocalClient();
  const [pageState, dispatchPageEvent] = useReducer(useMealPlanReducer, new MealPlanPageState(mealPlan));

  const [unvotedMealPlanEvents, setUnvotedMealPlanEvents] = useState<Array<MealPlanEvent>>([]);
  const [votedMealPlanEvents, setVotedMealPlanEvents] = useState<Array<MealPlanEvent>>([]);

  console.dir(`groceryList: ${JSON.stringify(groceryList)}`);
  console.dir(`tasks: ${JSON.stringify(tasks)}`);

  useEffect(() => {
    const getUnvotedMealPlanEvents = (mealPlan: MealPlan, userID: string): Array<MealPlanEvent> => {
      return mealPlan.events.filter((event: MealPlanEvent) => {
        return (
          event.options.find((option: MealPlanOption) => {
            return (option.votes || []).find((vote: MealPlanOptionVote) => vote.byUser === userID) === undefined;
          }) !== undefined
        );
      });
    };

    const getVotedForMealPlanEvents = (mealPlan: MealPlan, userID: string): Array<MealPlanEvent> => {
      return mealPlan.events.filter((event: MealPlanEvent) => {
        return (
          event.options.find((option: MealPlanOption) => {
            return (option.votes || []).find((vote: MealPlanOptionVote) => vote.byUser === userID) !== undefined;
          }) !== undefined
        );
      });
    };

    setUnvotedMealPlanEvents(getUnvotedMealPlanEvents(pageState.mealPlan, userID));
    setVotedMealPlanEvents(getVotedForMealPlanEvents(pageState.mealPlan, userID));
  }, [pageState.mealPlan, userID]);

  const submitMealPlanVotes = (eventIndex: number): void => {
    const submission = new MealPlanOptionVoteCreationRequestInput({
      votes: pageState.mealPlan.events[eventIndex].options.map((option: MealPlanOption, rank: number) => {
        return {
          belongsToMealPlanOption: option.id,
          rank: rank,
          notes: '',
          abstain: false,
        };
      }),
    });

    apiClient
      .voteForMealPlan(mealPlan.id, pageState.mealPlan.events[eventIndex].id, submission)
      .then((votesResult: AxiosResponse<Array<MealPlanOptionVote>>) => {
        dispatchPageEvent({
          type: 'ADD_VOTES_TO_MEAL_PLAN',
          eventIndex: eventIndex,
          votes: votesResult.data,
        });
      })
      .catch((error: Error) => {
        console.error(error);
      });
  };

  const markGroceryListItemAsPurchased = (groceryListItemID: string): void => {
    apiClient.deleteMealPlanGroceryListItem(mealPlan.id, groceryListItemID).then(() => {});
  };

  const formatIngredientForTotalList = (groceryItem: MealPlanGroceryListItem): ReactNode => {
    const minQty = cleanFloat(groceryItem.minimumQuantityNeeded);
    const maxQty = cleanFloat(groceryItem.maximumQuantityNeeded || -1);
    const measurmentUnitName = minQty === 1 ? groceryItem.measurementUnit.name : groceryItem.measurementUnit.pluralName;

    return (
      <List.Item key={groceryItem.id} m="-sm">
        <Checkbox
          label={
            <>
              <u>
                {` ${minQty}${maxQty > 0 ? `- ${maxQty}` : ''} ${
                  ['unit', 'units'].includes(measurmentUnitName) ? '' : measurmentUnitName
                }`}
              </u>{' '}
              {groceryItem.ingredient?.name}
            </>
          }
        />
      </List.Item>
    );
  };

  const formatTaskForTotalList = (task: MealPlanTask): ReactNode => {
    return (
      <List.Item key={task.id} m="-sm">
        <Checkbox label={<>{task.recipePrepTask.notes}</>} />
      </List.Item>
    );
  };

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

          {unvotedMealPlanEvents.length > 0 && <Divider label="awaiting votes" labelPosition="center" />}

          <Grid>
            {unvotedMealPlanEvents.map((event: MealPlanEvent, eventIndex: number) => {
              return (
                <Card shadow="xs" radius="md" withBorder my="xl" key={eventIndex}>
                  <Grid justify="center" align="center">
                    <Grid.Col span="auto">
                      <Text>
                        Rank choices or {event.mealName} at {format(new Date(event.startsAt), dateFormat)}
                      </Text>
                    </Grid.Col>
                    {mealPlan.status === 'awaiting_votes' && (
                      <Grid.Col span="content" sx={{ float: 'right' }}>
                        <Button onClick={() => submitMealPlanVotes(eventIndex)}>Submit Vote</Button>
                      </Grid.Col>
                    )}
                  </Grid>
                  {event.options.map((option: MealPlanOption, optionIndex: number) => {
                    return (
                      <Grid key={optionIndex}>
                        <Grid.Col span="auto">
                          <Indicator
                            position="top-start"
                            offset={2}
                            size={16}
                            disabled={optionIndex > 2}
                            color={
                              (optionIndex === 0 && 'yellow') ||
                              (optionIndex === 1 && 'gray') ||
                              (optionIndex === 2 && '#CD7F32') ||
                              'blue'
                            }
                            label={`#${optionIndex + 1}`}
                          >
                            <Card shadow="xs" radius="md" withBorder mt="xs">
                              <SimpleGrid>
                                <Link key={option.meal.id} href={`/meals/${option.meal.id}`}>
                                  {option.meal.name}
                                </Link>
                              </SimpleGrid>
                            </Card>
                          </Indicator>
                        </Grid.Col>
                        <Grid.Col span="content">
                          <Stack align="center" spacing="xs" mt="sm">
                            <ActionIcon
                              variant="outline"
                              size="sm"
                              aria-label="remove recipe step vessel"
                              disabled={optionIndex === 0}
                              onClick={() => {
                                dispatchPageEvent({
                                  type: 'MOVE_OPTION',
                                  eventIndex: eventIndex,
                                  optionIndex: optionIndex,
                                  direction: 'up',
                                });
                              }}
                            >
                              <IconArrowUp size="md" />
                            </ActionIcon>
                            <ActionIcon
                              variant="outline"
                              size="sm"
                              aria-label="remove recipe step vessel"
                              disabled={optionIndex === event.options.length - 1}
                              onClick={() => {
                                dispatchPageEvent({
                                  type: 'MOVE_OPTION',
                                  eventIndex: eventIndex,
                                  optionIndex: optionIndex,
                                  direction: 'down',
                                });
                              }}
                            >
                              <IconArrowDown size="md" />
                            </ActionIcon>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    );
                  })}

                  {getMissingVotersForMealPlanEvent(event, household, userID).length > 0 && (
                    <Grid justify="center" align="center">
                      <Grid.Col span="auto">
                        <sub>{`(awaiting votes from ${new Intl.ListFormat('en').format(
                          getMissingVotersForMealPlanEvent(event, household, userID),
                        )})`}</sub>
                      </Grid.Col>
                    </Grid>
                  )}
                </Card>
              );
            })}
          </Grid>

          {votedMealPlanEvents.length > 0 && <Divider label="voted for" labelPosition="center" />}

          <Grid>
            {votedMealPlanEvents.map((event: MealPlanEvent, eventIndex: number) => {
              return (
                <Card shadow="xs" radius="md" withBorder my="xl" key={eventIndex}>
                  <Grid justify="center" align="center">
                    <Title order={4}>{format(new Date(event.startsAt), 'M/d/yy @ h aa')}</Title>
                  </Grid>
                  {event.options.map((option: MealPlanOption, optionIndex: number) => {
                    return (
                      <Grid key={optionIndex}>
                        <Grid.Col span="auto">
                          <Indicator
                            position="top-start"
                            offset={2}
                            label={
                              (option.votes || []).find(
                                (vote: MealPlanOptionVote) => vote.byUser === userID && vote.rank === 0,
                              ) !== undefined
                                ? '⭐'
                                : ''
                            }
                            color="none"
                          >
                            <Card shadow="xs" radius="md" withBorder mt="xs">
                              <SimpleGrid>
                                <Link key={option.meal.id} href={`/meals/${option.meal.id}`}>
                                  {option.meal.name}
                                </Link>
                              </SimpleGrid>
                            </Card>
                          </Indicator>
                        </Grid.Col>
                      </Grid>
                    );
                  })}

                  {getMissingVotersForMealPlanEvent(event, household, userID).length > 0 && (
                    <Grid justify="center" align="center">
                      <Grid.Col span="auto">
                        <sub>{`(awaiting votes from ${new Intl.ListFormat('en').format(
                          getMissingVotersForMealPlanEvent(event, household, userID),
                        )})`}</sub>
                      </Grid.Col>
                    </Grid>
                  )}
                </Card>
              );
            })}
          </Grid>

          {pageState.mealPlan.events.filter(
            (event: MealPlanEvent) => event.options.filter((option: MealPlanOption) => !option.chosen).length === 0,
          ).length > 0 && <Divider my="xl" label="decided" labelPosition="center" />}

          {groceryList.length > 0 && (
            <>
              <Divider label="grocery list" labelPosition="center" />
              <List icon={<></>} mt={-10}>
                {groceryList.map(formatIngredientForTotalList)}
              </List>
            </>
          )}

          {tasks.length > 0 && (
            <>
              <Space h="xl" />
              <Divider label="tasks" labelPosition="center" />
              <List icon={<></>} mt={-10}>
                {tasks.map(formatTaskForTotalList)}
              </List>
            </>
          )}
        </Stack>
      </Center>
    </AppLayout>
  );
}

export default MealPlanPage;
