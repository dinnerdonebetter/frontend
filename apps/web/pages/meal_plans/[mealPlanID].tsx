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
} from '@mantine/core';
import Link from 'next/link';
import { Reducer, useReducer } from 'react';
import { format } from 'date-fns';
import { IconArrowDown, IconArrowUp } from '@tabler/icons';

import {
  Household,
  HouseholdUserMembershipWithUser,
  Meal,
  MealPlan,
  MealPlanEvent,
  MealPlanGroceryListItem,
  MealPlanOption,
  MealPlanOptionVote,
  MealPlanOptionVoteCreationRequestInput,
} from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { serverSideTracer } from '../../src/tracer';
import { serverSideAnalytics } from '../../src/analytics';
import { extractUserInfoFromCookie } from '../../src/auth';
import { AxiosError, AxiosResponse } from 'axios';

declare interface MealPlanPageProps {
  mealPlan: MealPlan;
  userID: string;
  household: Household;
  groceryList: MealPlanGroceryListItem[];
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<MealPlanPageProps>> => {
  const span = serverSideTracer.startSpan('MealPlanPage.getServerSideProps');
  const apiClient = buildServerSideClient(context);

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
  const mealPlan = await apiClient
    .getMealPlan(mealPlanID.toString())
    .then((result) => {
      span.addEvent(`meal plan retrieved`);
      return result.data;
    })
    .catch((error: AxiosError) => {
      if (error.response?.status === 404) {
        notFound = true;
      }
    });

  const household = await apiClient
    .getCurrentHouseholdInfo()
    .then((result) => {
      span.addEvent(`household retrieved`);
      return result.data;
    })
    .catch((error: AxiosError) => {
      if (error.response?.status === 404) {
        notFound = true;
      }
    });

  const groceryList = await apiClient.getMealPlanGroceryListItems(mealPlanID.toString()).then((result) => {
    span.addEvent('meal plan grocery list items retrieved');
    return result.data;
  });

  if (notFound || !mealPlan || !household) {
    return {
      redirect: {
        destination: '/meal_plans',
        permanent: false,
      },
    };
  }

  span.end();
  return {
    props: {
      mealPlan: mealPlan!,
      household: household!,
      userID: userSessionData.userID,
      groceryList: groceryList || [],
    },
  };
};

const dateFormat = 'h aa M/d/yy';

/* BEGIN Meal Plan Creation Reducer */

type mealPlanPageAction = { type: 'MOVE_OPTION'; eventIndex: number; optionIndex: number; direction: 'up' | 'down' };

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

    default:
      console.error(`Unhandled action type`);
      return state;
  }
};

/* END Meal Plan Creation Reducer */

function MealPlanPage({ mealPlan, userID, household }: MealPlanPageProps) {
  const apiClient = buildLocalClient();
  const [pageState, dispatchPageEvent] = useReducer(useMealPlanReducer, new MealPlanPageState(mealPlan));

  const getUnvotedMealPlanEvents = (pageState: MealPlanPageState, userID: string) => {
    return (): Array<MealPlanEvent> => {
      return pageState.mealPlan.events.filter((event: MealPlanEvent) => {
        return (
          event.options.find((option: MealPlanOption) => {
            return (option.votes || []).find((vote: MealPlanOptionVote) => vote.byUser === userID) === undefined;
          }) !== undefined
        );
      });
    };
  };

  const getVotedForMealPlanEvents = (pageState: MealPlanPageState, userID: string) => {
    return (): Array<MealPlanEvent> => {
      return pageState.mealPlan.events.filter((event: MealPlanEvent) => {
        return (
          event.options.find((option: MealPlanOption) => {
            return (option.votes || []).find((vote: MealPlanOptionVote) => vote.byUser === userID) !== undefined;
          }) !== undefined
        );
      });
    };
  };

  interface missingVote {
    optionID: string;
    user: string;
  }

  const getMissingVotersForMealPlanEvent = (mealPlanEvent: MealPlanEvent, household: Household): Array<string> => {
    const missingVotes: Set<string> = new Set<string>();

    mealPlanEvent.options.forEach((option: MealPlanOption) => {
      household.members.forEach((member: HouseholdUserMembershipWithUser) => {
        if (
          (option.votes || []).find((vote: MealPlanOptionVote) => vote.byUser === member.belongsToUser!.id) ===
          undefined
        ) {
          missingVotes.add(member.belongsToUser!.username);
        }
      });
    });

    return Array.from(missingVotes.values());
  };

  const sortMissingVotesByUser = (missingVotes: Array<missingVote>): Map<string, Array<missingVote>> => {
    const sortedMissingVotes = new Map<string, Array<missingVote>>();

    missingVotes.forEach((missingVote: missingVote) => {
      console.log(`missing vote: ${missingVote.user}`);
      if (sortedMissingVotes.get(missingVote.user)) {
        sortedMissingVotes.set(missingVote.user, [missingVote, ...sortedMissingVotes.get(missingVote.user)!]);
      } else {
        sortedMissingVotes.set(missingVote.user, [missingVote]);
      }
    });

    return sortedMissingVotes;
  };

  const fart = (user: string, votes: Array<missingVote>) => {
    return (
      <Text>
        {user} still has to vote for {votes.length} events.
      </Text>
    );
  };

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

    console.dir(submission);

    apiClient
      .voteForMealPlan(mealPlan.id, pageState.mealPlan.events[eventIndex].id, submission)
      .then((_result: AxiosResponse<Array<MealPlanOptionVote>>) => {
        console.log('vote submitted');
      })
      .catch((error: Error) => {
        console.error(error);
      });
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

          {getUnvotedMealPlanEvents(pageState, userID).length > 0 && (
            <Divider label="awaiting votes" labelPosition="center" />
          )}

          <Grid>
            {getUnvotedMealPlanEvents(pageState, userID)().map((event: MealPlanEvent, eventIndex: number) => {
              return (
                <Card shadow="xs" radius="md" withBorder my="xl" key={eventIndex}>
                  <Grid justify="center" align="center">
                    <Grid.Col span={6}>
                      <Title order={4}>{format(new Date(event.startsAt), dateFormat)}</Title>
                    </Grid.Col>
                    {mealPlan.status === 'awaiting_votes' && (
                      <Grid.Col span={6}>
                        <Button sx={{ float: 'right' }} onClick={() => submitMealPlanVotes(eventIndex)}>
                          Submit Vote
                        </Button>
                      </Grid.Col>
                    )}
                  </Grid>
                  {event.options.map((option: MealPlanOption, optionIndex: number) => {
                    return (
                      <Grid key={optionIndex}>
                        <Grid.Col span="auto">
                          <Indicator position="top-start" offset={2} label={optionIndex === 0 ? '⭐' : ''} color="none">
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

                  {getMissingVotersForMealPlanEvent(event, household).length > 0 && (
                    <Grid justify="center" align="center">
                      <Grid.Col span="auto">
                        <sub>{`(awaiting votes from ${new Intl.ListFormat('en').format(
                          getMissingVotersForMealPlanEvent(event, household),
                        )})`}</sub>
                      </Grid.Col>
                    </Grid>
                  )}
                </Card>
              );
            })}
          </Grid>

          {getVotedForMealPlanEvents(pageState, userID).length > 0 && (
            <Divider label="voted for" labelPosition="center" />
          )}

          <Grid>
            {getVotedForMealPlanEvents(pageState, userID)().map((event: MealPlanEvent) => {
              return (
                <Card shadow="xs" radius="md" withBorder my="xl">
                  <Grid justify="center" align="center">
                    <Title order={4}>{format(new Date(event.startsAt), 'M/d/yy @ h aa')}</Title>
                  </Grid>
                  {event.options.map((option: MealPlanOption, optionIndex: number) => {
                    return (
                      <Grid>
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
                </Card>
              );
            })}
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
