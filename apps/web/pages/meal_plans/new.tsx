import { AxiosError, AxiosResponse } from 'axios';
import { Reducer, useEffect, useReducer, useState } from 'react';
import {
  SimpleGrid,
  Button,
  Grid,
  Autocomplete,
  Container,
  Select,
  AutocompleteItem,
  List,
  ActionIcon,
  Divider,
  MediaQuery,
} from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { intlFormat, nextMonday, addHours, subMinutes, formatISO, addDays, parseISO } from 'date-fns';

import {
  Meal,
  MealList,
  MealPlan,
  MealPlanCreationRequestInput,
  MealPlanEvent,
  MealPlanEventCreationRequestInput,
  MealPlanOption,
} from '@prixfixeco/models';

import { buildLocalClient } from '../../lib/client';
import { AppLayout } from '../../lib/layouts';
import { IconCircleMinus, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';

/* BEGIN Meal Plan Creation Reducer */

type mealPlanCreationAction =
  | { type: 'UPDATE_SUBMISSION_ERROR'; error: string }
  | { type: 'REMOVE_EVENT'; eventIndex: number }
  | { type: 'SET_EVENT_START_DATE'; eventIndex: number; newStartDate: string }
  | { type: 'SET_EVENT_START_TIME'; eventIndex: number; newStartTime: string }
  | { type: 'SET_MEAL_QUERY_FOR_INDEX'; eventIndex: number; query: string }
  | { type: 'SET_MEAL_SUGGESTIONS_FOR_INDEX'; eventIndex: number; suggestions: Meal[] }
  | { type: 'ADD_MEAL_TO_EVENT'; eventIndex: number; mealName: string }
  | { type: 'REMOVE_MEAL_FROM_EVENT'; eventIndex: number; meal: Meal }
  | { type: 'ADD_EVENT' };

export class MealPlanCreationPageState {
  mealPlan: MealPlan = buildInitialMealPlan();
  mealQueries: string[] = [''];
  currentMealQuery: string = '';
  currentMealQueryIndex: number = -1;
  mealSuggestions: Meal[][] = [[]];
  submissionError: string | null = null;
}

const useMealCreationReducer: Reducer<MealPlanCreationPageState, mealPlanCreationAction> = (
  state: MealPlanCreationPageState,
  action: mealPlanCreationAction,
): MealPlanCreationPageState => {
  switch (action.type) {
    case 'UPDATE_SUBMISSION_ERROR':
      return {
        ...state,
        submissionError: action.error,
      };

    case 'SET_EVENT_START_DATE':
      var newEvents = [...state.mealPlan.events];
      newEvents[action.eventIndex].startsAt = action.newStartDate;

      return {
        ...state,
        mealPlan: { ...state.mealPlan, events: newEvents },
      };

    case 'SET_EVENT_START_TIME':
      var newEvents = [...state.mealPlan.events];
      let newStartTime = parseISO(newEvents[action.eventIndex].startsAt);
      let parsedNewStartTime = parseISO(action.newStartTime);
      newStartTime.setHours(parsedNewStartTime.getHours());
      newStartTime.setMinutes(parsedNewStartTime.getMinutes());

      newEvents[action.eventIndex].startsAt = formatISO(newStartTime);

      return {
        ...state,
        mealPlan: { ...state.mealPlan, events: newEvents },
      };

    case 'ADD_EVENT':
      let startsAt = new Date();
      if (state.mealPlan.events.length > 0) {
        startsAt = addDays(new Date(state.mealPlan.events[state.mealPlan.events.length - 1].endsAt), 1);
      }

      const newEvent = new MealPlanEvent({
        mealName: 'dinner',
        startsAt: formatISO(startsAt),
        endsAt: formatISO(addHours(startsAt, 1)),
      });

      return {
        ...state,
        mealPlan: { ...state.mealPlan, events: [...state.mealPlan.events, newEvent] },
        mealQueries: [...state.mealQueries, ''],
        mealSuggestions: [...state.mealSuggestions, []],
      };

    case 'REMOVE_EVENT':
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          events: state.mealPlan.events.filter((_, index) => index !== action.eventIndex),
        },
      };

    case 'SET_MEAL_QUERY_FOR_INDEX':
      return {
        ...state,
        mealQueries: state.mealQueries.map((query, index) => (index === action.eventIndex ? action.query : query)),
        currentMealQuery: action.query,
        currentMealQueryIndex: action.eventIndex,
      };

    case 'SET_MEAL_SUGGESTIONS_FOR_INDEX':
      return {
        ...state,
        mealSuggestions: state.mealSuggestions.map((suggestions, index) =>
          index === action.eventIndex ? action.suggestions : suggestions,
        ),
      };

    case 'ADD_MEAL_TO_EVENT':
      if (
        !state.mealSuggestions[action.eventIndex].find((x: Meal) => {
          return x.name === action.mealName;
        })
      ) {
        console.error('Tried to add a meal that was not in the suggestions');
        return state;
      }

      return {
        ...state,
        mealQueries: state.mealQueries.map((query, index) => (index === action.eventIndex ? '' : query)),
        mealSuggestions: state.mealSuggestions.map((suggestions, index) =>
          index === action.eventIndex ? [] : suggestions,
        ),
        currentMealQuery: '',
        currentMealQueryIndex: -1,
        mealPlan: {
          ...state.mealPlan,
          events: state.mealPlan.events.map((event, index) =>
            index === action.eventIndex
              ? {
                  ...event,
                  options: [
                    ...event.options,
                    new MealPlanOption({
                      meal: state.mealSuggestions[action.eventIndex].find((x: Meal) => {
                        return x.name === action.mealName;
                      }),
                    }),
                  ],
                }
              : event,
          ),
        },
      };

    case 'REMOVE_MEAL_FROM_EVENT':
      return {
        ...state,
        mealPlan: {
          ...state.mealPlan,
          events: state.mealPlan.events.map((event, index) =>
            index === action.eventIndex
              ? {
                  ...event,
                  options: event.options.filter((option) => option.meal.id !== action.meal.id),
                }
              : event,
          ),
        },
      };

    default:
      console.error(`Unhandled action type`);
      return state;
  }
};

/* END Meal Plan Creation Reducer */

function buildInitialMealPlanEvent(): MealPlanEvent {
  const d = new Date();
  const nm = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  return new MealPlanEvent({
    mealName: 'dinner',
    startsAt: formatISO(nm),
    endsAt: formatISO(addHours(nm, 1)),
  });
}

function buildInitialMealPlan(): MealPlan {
  const d = new Date();
  const nm = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  return new MealPlan({
    notes: '',
    votingDeadline: subMinutes(nm, 30).toISOString(),
    events: [buildInitialMealPlanEvent()],
  });
}

const dayOfTheWeek = (event: MealPlanEvent | MealPlanEventCreationRequestInput): string => {
  return intlFormat(new Date(event.startsAt), {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
  });
};

const determineMinDate = (input: MealPlan | MealPlanCreationRequestInput, index: number): Date => {
  const d = new Date();
  let minDate = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  if ((input.events || []).length > 1 && index !== 0) {
    const lastEvent = input.events[input.events.length - 1];
    minDate = new Date(lastEvent.endsAt);
  }

  return minDate;
};

const mealPlanSubmissionShouldBeDisabled = (mealPlan: MealPlan): boolean => {
  const problems: string[] = [];

  if (mealPlan.events.length === 0) {
    problems.push('You must have at least one event');
  }

  mealPlan.events.forEach((event: MealPlanEvent, index: number) => {
    if (event.options.length === 0) {
      problems.push(`Event ${index + 1} has no options`);
    }

    if (!event.mealName) {
      problems.push(`Event ${index + 1} has no meal name`);
    }

    if (!event.startsAt) {
      problems.push(`Event ${index + 1} has no start time`);
    }

    if (!event.endsAt) {
      problems.push(`Event ${index + 1} has no end time`);
    }

    event.options.forEach((option: MealPlanOption) => {
      if (!option.meal) {
        problems.push(`Event ${index + 1} is missing a meal`);
      }
    });
  });

  console.debug(`mealPlanSubmissionShouldBeDisabled: ${problems}`);

  return !(problems.length === 0);
};

export default function NewMealPlanPage(): JSX.Element {
  const router = useRouter();
  const apiClient = buildLocalClient();

  const [pageState, dispatchMealPlanUpdate] = useReducer(useMealCreationReducer, new MealPlanCreationPageState());
  const [submissionShouldBeDisabled, setSubmissionShouldBeDisabled] = useState(true);

  useEffect(() => {
    setSubmissionShouldBeDisabled(mealPlanSubmissionShouldBeDisabled(pageState.mealPlan));
  }, [pageState.mealPlan]);

  useEffect(() => {
    console.debug(`useEffect invoked for currentMealQuery`);
    const query = (pageState.currentMealQuery || '').trim();
    const pfClient = buildLocalClient();
    if (query.length > 2 && pageState.currentMealQueryIndex >= 0) {
      pfClient
        .searchForMeals(query)
        .then((response: AxiosResponse<MealList>) => {
          dispatchMealPlanUpdate({
            type: 'SET_MEAL_SUGGESTIONS_FOR_INDEX',
            suggestions: response.data.data.filter((x: Meal) => {
              return !pageState.mealPlan.events.find((y: MealPlanEvent) => {
                return y.options.find((z: MealPlanOption) => {
                  return z.meal.id === x.id;
                });
              });
            }),
            eventIndex: pageState.currentMealQueryIndex,
          });
        })
        .catch((error: AxiosError) => {
          console.error(error);
        });
    }
  }, [pageState.currentMealQuery, pageState.currentMealQueryIndex]);

  let chosenMeals = (events: MealPlanEvent[], eventIndex: number) => {
    return (events[eventIndex]?.options || []).map((option: MealPlanOption) => {
      return (
        <List.Item key={option.meal.id} icon={<></>} pt="xs">
          <Grid>
            <Grid.Col span="auto" mt={5}>
              {option.meal.name}
            </Grid.Col>
            <Grid.Col span={1}>
              <ActionIcon
                onClick={() =>
                  dispatchMealPlanUpdate({ type: 'REMOVE_MEAL_FROM_EVENT', eventIndex: eventIndex, meal: option.meal })
                }
                sx={{ float: 'right' }}
                aria-label="remove meal candidate from event"
              >
                <IconX color="tomato" />
              </ActionIcon>
            </Grid.Col>
          </Grid>
        </List.Item>
      );
    });
  };

  const mealPlanEvents = pageState.mealPlan.events.map((event: MealPlanEvent, index: number) => {
    let minDate = determineMinDate(pageState.mealPlan, index);

    return (
      <Container key={`${event.mealName} on ${dayOfTheWeek(event)}`}>
        {index > 0 && (
          <MediaQuery largerThan="sm" styles={(_theme) => ({ display: 'none' })}>
            <Divider m="lg" />
          </MediaQuery>
        )}

        <Grid justify="space-between">
          <Grid.Col span={3}>{/* this left intentionally blank */}</Grid.Col>
          <Grid.Col span={3}>
            <ActionIcon
              variant="outline"
              size="sm"
              style={{ float: 'right' }}
              aria-label="remove event"
              disabled={pageState.mealPlan.events.length === 1}
              onClick={() => dispatchMealPlanUpdate({ type: 'REMOVE_EVENT', eventIndex: index })}
            >
              <IconCircleMinus size={16} color={pageState.mealPlan.events.length === 1 ? 'gray' : 'red'} />
            </ActionIcon>
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={1}>
          <Select
            label="Meal"
            placeholder="Pick one"
            value={event.mealName}
            disabled
            data={[{ value: 'dinner', label: 'Dinner' }]}
            onChange={(_value: string) => {}}
          />

          <Grid>
            <Grid.Col span={6}>
              <TimeInput
                label="Pick time"
                format="12"
                disabled
                defaultValue={new Date(0, 0, 0, 18, 0, 0, 0)}
                onChange={(value: Date) =>
                  dispatchMealPlanUpdate({
                    type: 'SET_EVENT_START_TIME',
                    eventIndex: index,
                    newStartTime: formatISO(value),
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePicker
                value={new Date(event.startsAt)}
                placeholder="Pick date"
                label="Event date"
                withAsterisk
                initialLevel="date"
                clearable={false}
                minDate={minDate}
                onChange={(value: Date) =>
                  dispatchMealPlanUpdate({
                    type: 'SET_EVENT_START_DATE',
                    eventIndex: index,
                    newStartDate: formatISO(value),
                  })
                }
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <List>{chosenMeals(pageState.mealPlan.events, index)}</List>
          </Grid>

          <Autocomplete
            value={pageState.mealQueries[index]}
            onChange={(value: string) =>
              dispatchMealPlanUpdate({ type: 'SET_MEAL_QUERY_FOR_INDEX', eventIndex: index, query: value })
            }
            required
            limit={20}
            label="Meal name"
            placeholder="Baba Ganoush"
            dropdownPosition="bottom"
            onItemSubmit={(item: AutocompleteItem) => {
              dispatchMealPlanUpdate({ type: 'ADD_MEAL_TO_EVENT', eventIndex: index, mealName: item.value });
            }}
            data={pageState.mealSuggestions[index].map((x: Meal) => ({ value: x.name, label: x.name }))}
          />
        </SimpleGrid>
      </Container>
    );
  });

  const submitMealPlan = () => {
    apiClient
      .createMealPlan(MealPlan.toCreationRequestInput(pageState.mealPlan))
      .then((response: AxiosResponse<MealPlan>) => {
        router.push(`/meal_plans/${response.data.id}`);
      })
      .catch((error: AxiosError) => {
        console.error(error);
        dispatchMealPlanUpdate({ type: 'UPDATE_SUBMISSION_ERROR', error: error.message });
      });
  };

  return (
    <AppLayout title="New Meal Plan">
      <Grid justify="space-between">
        <Grid.Col span={3} mb={6}>
          <Button
            disabled={pageState.mealPlan.events.length >= 5}
            onClick={() => dispatchMealPlanUpdate({ type: 'ADD_EVENT' })}
          >
            Add Event
          </Button>
        </Grid.Col>
        <Grid.Col span={3} mb={6}>
          <Button sx={{ float: 'right' }} disabled={submissionShouldBeDisabled} onClick={submitMealPlan}>
            Submit
          </Button>
        </Grid.Col>
      </Grid>

      <SimpleGrid
        breakpoints={[
          { minWidth: 'md', cols: 1 },
          { minWidth: 'lg', cols: 3 },
        ]}
        spacing="lg"
      >
        {mealPlanEvents}
      </SimpleGrid>
    </AppLayout>
  );
}
