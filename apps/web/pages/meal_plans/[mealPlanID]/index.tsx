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
  Box,
  Select,
  Group,
  Table,
  NumberInput,
  Tooltip,
  Badge,
} from '@mantine/core';
import Link from 'next/link';
import { ReactNode, Reducer, useEffect, useReducer, useState } from 'react';
import { format, formatDuration, subSeconds } from 'date-fns';
import { IconArrowDown, IconArrowUp, IconAxe, IconCheck, IconPencil, IconTrash } from '@tabler/icons';

import {
  ALL_MEAL_PLAN_TASK_STATUSES,
  ALL_VALID_MEAL_PLAN_GROCERY_LIST_ITEM_STATUSES,
  Household,
  HouseholdUserMembershipWithUser,
  MealComponent,
  MealPlan,
  MealPlanEvent,
  MealPlanGroceryListItem,
  MealPlanGroceryListItemUpdateRequestInput,
  MealPlanOption,
  MealPlanOptionVote,
  MealPlanOptionVoteCreationRequestInput,
  MealPlanTask,
  MealPlanTaskStatusChangeRequestInput,
  Recipe,
  RecipePrepTaskStep,
  RecipeStep,
  RecipeStepIngredient,
} from '@prixfixeco/models';

import { buildLocalClient, buildServerSideClient } from '../../../src/client';
import { AppLayout } from '../../../src/layouts';
import { serverSideTracer } from '../../../src/tracer';
import { serverSideAnalytics } from '../../../src/analytics';
import { extractUserInfoFromCookie } from '../../../src/auth';
import { AxiosError, AxiosResponse } from 'axios';
import { cleanFloat, getRecipeStepIndexByStepID } from '@prixfixeco/utils';
import { intervalToDuration } from 'date-fns';

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
  } else {
    console.log(`no user session data found for ${context.req.url}`);
  }

  const mealPlanPromise = apiClient.getMealPlan(mealPlanID).then((result) => {
    span.addEvent(`meal plan retrieved`);
    return result.data;
  });

  const householdPromise = apiClient.getCurrentHouseholdInfo().then((result) => {
    span.addEvent(`household retrieved`);
    return result.data;
  });

  const tasksPromise = apiClient.getMealPlanTasks(mealPlanID).then((result) => {
    span.addEvent('meal plan grocery list items retrieved');
    return result.data;
  });

  const groceryListPromise = apiClient.getMealPlanGroceryListItems(mealPlanID).then((result) => {
    span.addEvent('meal plan grocery list items retrieved');
    return result.data;
  });

  let notFound = false;
  let notAuthorized = false;
  const retrievedData = await Promise.all([mealPlanPromise, householdPromise, groceryListPromise, tasksPromise]).catch(
    (error: AxiosError) => {
      if (error.response?.status === 404) {
        notFound = true;
      } else if (error.response?.status === 401) {
        notAuthorized = true;
      } else {
        console.error(`${error.response?.status} ${error.response?.config?.url}}`);
      }
    },
  );

  if (notFound || !retrievedData) {
    return {
      redirect: {
        destination: '/meal_plans',
        permanent: false,
      },
    };
  }

  if (notAuthorized) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const [mealPlan, household, groceryList, tasks] = retrievedData;

  span.end();

  return {
    props: {
      mealPlan: mealPlan!,
      household: household!,
      userID: userSessionData?.userID || '',
      tasks: tasks,
      groceryList: groceryList || [],
    },
  };
};

const dateFormat = "h aa 'on' iiii',' M/d";

/* BEGIN Meal Plan Creation Reducer */

type mealPlanPageAction =
  | { type: 'MOVE_OPTION'; eventIndex: number; optionIndex: number; direction: 'up' | 'down' }
  | { type: 'ADD_VOTES_TO_MEAL_PLAN'; eventIndex: number; votes: MealPlanOptionVote[] }
  | { type: 'UPDATE_MEAL_PLAN_GROCERY_LIST_ITEM'; eventIndex: number; newItem: MealPlanGroceryListItem }
  | { type: 'UPDATE_MEAL_PLAN_TASK'; eventIndex: number; newTask: MealPlanTask };

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

    case 'UPDATE_MEAL_PLAN_TASK':
      return {
        ...state,
      };

    case 'UPDATE_MEAL_PLAN_GROCERY_LIST_ITEM':
      return {
        ...state,
      };

    default:
      console.error(`Unhandled action type`);
      return state;
  }
};

/* END Meal Plan Creation Reducer */

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

const getUnvotedMealPlanEvents = (mealPlan: MealPlan, userID: string): Array<MealPlanEvent> => {
  return (mealPlan.events || []).filter((event: MealPlanEvent) => {
    return (
      event.options.find(
        (option: MealPlanOption) =>
          option.votes.find((vote: MealPlanOptionVote) => vote.byUser === userID) === undefined,
      ) !== undefined
    );
  });
};

const getVotedForMealPlanEvents = (mealPlan: MealPlan, userID: string): Array<MealPlanEvent> => {
  return (mealPlan.events || []).filter((event: MealPlanEvent) => {
    return (
      event.options.find(
        (option: MealPlanOption) =>
          option.votes.find((vote: MealPlanOptionVote) => vote.byUser === userID) !== undefined,
      ) !== undefined
    );
  });
};

const getChosenMealPlanEvents = (mealPlan: MealPlan): Array<MealPlanEvent> => {
  return mealPlan.events.filter((event: MealPlanEvent) => {
    return (
      (event.options || []).find((option: MealPlanOption) => {
        return option.chosen;
      }) !== undefined
    );
  });
};

const getMealPlanTasksForRecipe = (tasks: MealPlanTask[], recipeID: string): Array<MealPlanTask> => {
  return tasks.filter((task: MealPlanTask) => {
    return task.recipePrepTask.belongsToRecipe === recipeID;
  });
};

const getRecipesForMealPlanOptions = (options: MealPlanOption[]): Array<Recipe> => {
  return options
    .map((opt: MealPlanOption) => opt.meal.components.map((component: MealComponent) => component.recipe))
    .flat();
};

const findRecipeInMealPlan = (mealPlan: MealPlan, recipeID: string): Recipe | undefined => {
  let recipeToReturn = undefined;

  mealPlan.events.forEach((event: MealPlanEvent) => {
    event.options.forEach((option: MealPlanOption) => {
      option.meal.components.forEach((component: MealComponent) => {
        if (component.recipe.id === recipeID) {
          recipeToReturn = component.recipe;
        }
      });
    });
  });

  return recipeToReturn;
};

function MealPlanPage({ mealPlan, userID, household, groceryList, tasks }: MealPlanPageProps) {
  const apiClient = buildLocalClient();
  const [pageState, dispatchPageEvent] = useReducer(useMealPlanReducer, new MealPlanPageState(mealPlan));

  const [unvotedMealPlanEvents, setUnvotedMealPlanEvents] = useState<Array<MealPlanEvent>>([]);
  const [votedMealPlanEvents, setVotedMealPlanEvents] = useState<Array<MealPlanEvent>>([]);

  useEffect(() => {
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

  return (
    <AppLayout title="Meal Plan" containerSize="xl">
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

          {mealPlan.status === 'awaiting_votes' && <Divider label="awaiting votes" labelPosition="center" />}

          {unvotedMealPlanEvents.map((event: MealPlanEvent, eventIndex: number) => {
            return (
              <Card shadow="xs" radius="md" withBorder my="xl" key={eventIndex}>
                <Grid justify="center" align="center">
                  <Grid.Col span="auto">
                    <Text>
                      Rank choices for {event.mealName} at {format(new Date(event.startsAt), dateFormat)}
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
                      {!event.options.find((opt: MealPlanOption) => opt.chosen) && (
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
                      )}
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

          {mealPlan.status === 'finalized' && <Divider label="voted for" labelPosition="center" />}

          {votedMealPlanEvents.map((event: MealPlanEvent, eventIndex: number) => {
            return (
              <Card shadow="xs" radius="md" withBorder my="xl" key={eventIndex}>
                <Grid justify="center" align="center">
                  <Title order={4}>{format(new Date(event.startsAt), 'M/d/yy @ h aa')}</Title>
                </Grid>
                {event.options
                  .sort((a: MealPlanOption, b: MealPlanOption) => (a.chosen ? -1 : b.chosen ? 1 : 0))
                  .map((option: MealPlanOption, optionIndex: number) => {
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
                      <small>{`(awaiting votes from ${new Intl.ListFormat('en').format(
                        getMissingVotersForMealPlanEvent(event, household, userID),
                      )})`}</small>
                    </Grid.Col>
                  </Grid>
                )}
              </Card>
            );
          })}

          {pageState.mealPlan.events.filter(
            (event: MealPlanEvent) => event.options.filter((option: MealPlanOption) => !option.chosen).length === 0,
          ).length > 0 && <Divider my="xl" label="decided" labelPosition="center" />}

          <Grid>
            <Grid.Col span={12} md={7}>
              {getChosenMealPlanEvents(pageState.mealPlan).length > 0 && (
                <>
                  <Divider label="tasks" labelPosition="center" />
                  <List icon={<></>}>
                    {getChosenMealPlanEvents(pageState.mealPlan).map((event: MealPlanEvent, eventIndex: number) => {
                      return (
                        <div key={eventIndex}>
                          <List.Item>
                            For{' '}
                            <Link href={`/meals/${event.options.find((opt: MealPlanOption) => opt.chosen)!.meal.id}`}>
                              &nbsp;{event.mealName}&nbsp;
                            </Link>{' '}
                            at {format(new Date(event.startsAt), "h aa 'on' M/d/yy")}:&nbsp;
                          </List.Item>
                          <List icon={<></>} withPadding>
                            {getRecipesForMealPlanOptions(
                              event.options.filter((opt: MealPlanOption) => opt.chosen),
                            ).map((recipe: Recipe, recipeIndex: number) => {
                              return (
                                <div key={recipeIndex}>
                                  <List.Item>
                                    {'For'}&nbsp;<Link href={`/recipes/${recipe.id}`}>{recipe.name}</Link>:&nbsp;
                                  </List.Item>

                                  <List icon={<></>} withPadding>
                                    {getMealPlanTasksForRecipe(tasks, recipe.id)
                                      // .filter((mealPlanTask: MealPlanTask) => mealPlanTask.status === 'unfinished')
                                      .map((mealPlanTask: MealPlanTask, taskIndex: number) => {
                                        return (
                                          <Box key={taskIndex}>
                                            <List.Item>
                                              <Grid grow>
                                                <Grid.Col span="content">
                                                  <Tooltip label="Mark as done">
                                                    <ActionIcon
                                                      disabled={!['unfinished'].includes(mealPlanTask.status)}
                                                      onClick={() => {
                                                        apiClient
                                                          .updateMealPlanTaskStatus(
                                                            mealPlan.id,
                                                            mealPlanTask.id,
                                                            new MealPlanTaskStatusChangeRequestInput({
                                                              status: 'finished',
                                                            }),
                                                          )
                                                          .then((res: AxiosResponse<MealPlanTask>) => {
                                                            // TODO: figure this out
                                                          });
                                                      }}
                                                    >
                                                      <IconCheck />
                                                    </ActionIcon>
                                                  </Tooltip>
                                                </Grid.Col>
                                                <Grid.Col span="content">
                                                  <Tooltip label="Cancel">
                                                    <ActionIcon
                                                      disabled={!['unfinished'].includes(mealPlanTask.status)}
                                                      onClick={() => {
                                                        apiClient
                                                          .updateMealPlanTaskStatus(
                                                            mealPlan.id,
                                                            mealPlanTask.id,
                                                            new MealPlanTaskStatusChangeRequestInput({
                                                              status: 'canceled',
                                                            }),
                                                          )
                                                          .then((res: AxiosResponse<MealPlanTask>) => {
                                                            // TODO: figure this out
                                                          });
                                                      }}
                                                    >
                                                      <IconAxe />
                                                    </ActionIcon>
                                                  </Tooltip>
                                                </Grid.Col>
                                                <Grid.Col span="content">
                                                  <Text
                                                    strikethrough={['ignored', 'finished'].includes(
                                                      mealPlanTask.status,
                                                    )}
                                                  >
                                                    {`Between ${formatDuration(
                                                      intervalToDuration({
                                                        start: subSeconds(
                                                          new Date(event.startsAt),
                                                          mealPlanTask.recipePrepTask
                                                            .maximumTimeBufferBeforeRecipeInSeconds || 0,
                                                        ),
                                                        end: new Date(event.startsAt),
                                                      }),
                                                    )} before and `}
                                                    {mealPlanTask.recipePrepTask
                                                      .minimumTimeBufferBeforeRecipeInSeconds === 0
                                                      ? `time of ${event.mealName} prep, ${mealPlanTask.recipePrepTask.name}`
                                                      : format(
                                                          subSeconds(
                                                            new Date(event.startsAt),
                                                            mealPlanTask.recipePrepTask
                                                              .minimumTimeBufferBeforeRecipeInSeconds,
                                                          ),
                                                          "h aa 'on' M/d/yy",
                                                        )}
                                                    <Text size="xs">
                                                      (store {mealPlanTask.recipePrepTask.storageType})
                                                      <Badge ml="xs" size="sm">
                                                        Optional
                                                      </Badge>
                                                    </Text>
                                                  </Text>
                                                </Grid.Col>
                                              </Grid>
                                            </List.Item>
                                            {!['ignored', 'finished'].includes(mealPlanTask.status) && (
                                              <List icon={<></>} withPadding mx="lg" mb="lg">
                                                {mealPlanTask.recipePrepTask.recipeSteps.map(
                                                  (prepTaskStep: RecipePrepTaskStep, prepTaskStepIndex: number) => {
                                                    const relevantRecipe = findRecipeInMealPlan(
                                                      pageState.mealPlan,
                                                      mealPlanTask.recipePrepTask.belongsToRecipe,
                                                    )!;
                                                    const relevantRecipeStep = relevantRecipe.steps.find(
                                                      (step: RecipeStep) =>
                                                        step.id === prepTaskStep.belongsToRecipeStep,
                                                    )!;

                                                    return (
                                                      <List.Item key={prepTaskStepIndex} my="-sm">
                                                        <Text
                                                          strikethrough={['ignored', 'finished'].includes(
                                                            mealPlanTask.status,
                                                          )}
                                                        >
                                                          Step #{relevantRecipe.steps.indexOf(relevantRecipeStep) + 1} (
                                                          {relevantRecipeStep.preparation.name}{' '}
                                                          {new Intl.ListFormat('en').format(
                                                            relevantRecipeStep.ingredients.map(
                                                              (ingredient: RecipeStepIngredient) =>
                                                                ingredient.ingredient?.pluralName || ingredient.name,
                                                            ),
                                                          )}
                                                          )
                                                        </Text>
                                                      </List.Item>
                                                    );
                                                  },
                                                )}
                                              </List>
                                            )}
                                          </Box>
                                        );
                                      })}
                                  </List>
                                </div>
                              );
                            })}
                          </List>
                        </div>
                      );
                    })}
                  </List>
                </>
              )}
            </Grid.Col>
            <Grid.Col span={12} md={5}>
              {groceryList.length > 0 && (
                <>
                  <Divider label="grocery list" labelPosition="center" />

                  <Table mt="xl">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th></th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {groceryList.map((groceryListItem: MealPlanGroceryListItem, groceryListItemIndex: number) => {
                        return (
                          <tr key={groceryListItemIndex}>
                            <td>
                              {groceryListItem.minimumQuantityNeeded === 1
                                ? groceryListItem.ingredient.name
                                : groceryListItem.ingredient.pluralName}
                            </td>
                            <td>
                              <Grid>
                                <Grid.Col span={12} md={6}>
                                  <NumberInput hideControls value={groceryListItem.minimumQuantityNeeded} />
                                </Grid.Col>
                                <Grid.Col span={12} md={6} mt="xs">
                                  {groceryListItem.minimumQuantityNeeded === 1
                                    ? groceryListItem.measurementUnit.name
                                    : groceryListItem.measurementUnit.pluralName}
                                </Grid.Col>
                              </Grid>
                            </td>
                            <td>{groceryListItem.status === 'unknown' ? '' : groceryListItem.status}</td>
                            <td>
                              <Tooltip label="Acquired">
                                <ActionIcon
                                  onClick={() => {
                                    apiClient.updateMealPlanGroceryListItem(
                                      mealPlan.id,
                                      groceryListItem.id,
                                      new MealPlanGroceryListItemUpdateRequestInput({ status: 'acquired' }),
                                    );
                                  }}
                                >
                                  <IconCheck />
                                </ActionIcon>
                              </Tooltip>
                            </td>
                            <td>
                              <Tooltip label="Edit">
                                <ActionIcon
                                  onClick={() => {
                                    //
                                  }}
                                >
                                  <IconPencil />
                                </ActionIcon>
                              </Tooltip>
                            </td>
                            <td>
                              <Tooltip label="Nevermind">
                                <ActionIcon
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this item?')) {
                                      apiClient.deleteMealPlanGroceryListItem(mealPlan.id, groceryListItem.id);
                                    }
                                  }}
                                >
                                  <IconTrash />
                                </ActionIcon>
                              </Tooltip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </Center>
    </AppLayout>
  );
}

export default MealPlanPage;
