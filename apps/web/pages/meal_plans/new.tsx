import { AxiosResponse } from 'axios';
import { Reducer, useEffect, useReducer, useState } from 'react';
import {
  SimpleGrid,
  Button,
  CloseButton,
  Grid,
  Autocomplete,
  Space,
  Container,
  Select,
  AutocompleteItem,
} from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { intlFormat, nextMonday, addHours, subMinutes, formatISO, addDays, parseISO } from 'date-fns';
import Head from 'next/head';

import {
  Meal,
  MealComponent,
  MealList,
  MealPlan,
  MealPlanCreationRequestInput,
  MealPlanEvent,
  MealPlanEventCreationRequestInput,
} from '@prixfixeco/models';

import { buildLocalClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

/* BEGIN Meal Plan Creation Reducer */

type mealPlanCreationAction =
  | { type: 'UPDATE_SUBMISSION_ERROR'; newError: string }
  | { type: 'REMOVE_EVENT', eventIndex: number }
  | { type: 'SET_EVENT_START_DATE', eventIndex: number, newStartDate: string }
  | { type: 'SET_EVENT_START_TIME', eventIndex: number, newStartTime: string }
  | { type: 'SET_MEAL_QUERY', eventIndex: number, query: string }
  | { type: 'ADD_EVENT'; }

export class MealPlanCreationPageState {
  mealPlan: MealPlanCreationRequestInput = buildInitialMealPlan();
  mealQueries: string[] = [''];
  mealSuggestions: Meal[][] = [[]];
  submissionShouldBePrevented: boolean = true;
  submissionError: string | null = null;
}

const mealPlanSubmissionShouldBeDisabled = (pageState: MealPlanCreationPageState): boolean => {
  const componentProblems: string[] = [];

  return componentProblems.length === 0;
};

const useMealCreationReducer: Reducer<MealPlanCreationPageState, mealPlanCreationAction> = (
  state: MealPlanCreationPageState,
  action: mealPlanCreationAction,
): MealPlanCreationPageState => {
  switch (action.type) {
    case 'UPDATE_SUBMISSION_ERROR':
      console.log(`UPDATE_SUBMISSION_ERROR called with ${JSON.stringify(action)}`)
      return { ...state, submissionError: action.newError };

    case 'SET_EVENT_START_DATE':
      console.log(`SET_EVENT_START_DATE called with ${JSON.stringify(action)}`)
      var newEvents =  [ ...state.mealPlan.events];
      newEvents[action.eventIndex].startsAt = action.newStartDate;

      return { ...state, mealPlan: { ...state.mealPlan, events: newEvents } };

    case 'SET_EVENT_START_TIME':
      console.log(`SET_EVENT_START_TIME called with ${JSON.stringify(action)}`)
      var newEvents =  [ ...state.mealPlan.events];
      let newStartTime = parseISO(newEvents[action.eventIndex].startsAt);
      let parsedNewStartTime = parseISO(action.newStartTime);
      newStartTime.setHours(parsedNewStartTime.getHours());
      newStartTime.setMinutes(parsedNewStartTime.getMinutes());

      newEvents[action.eventIndex].startsAt = formatISO(newStartTime);

      return { ...state, mealPlan: { ...state.mealPlan, events: newEvents } };

    case 'ADD_EVENT':
      console.log(`ADD_EVENT called with ${JSON.stringify(action)}`)
      let startsAt = new Date();
      if (state.mealPlan.events.length > 0) {
        const lastEvent = state.mealPlan.events[state.mealPlan.events.length - 1];
        startsAt = addDays(new Date(lastEvent.endsAt), 1);
      }

      const newEvent = new MealPlanEventCreationRequestInput({
        startsAt: formatISO(startsAt),
        endsAt: formatISO(addHours(startsAt, 1)),
      });

      return { ...state,
        mealPlan: { ...state.mealPlan, events: [...state.mealPlan.events, newEvent] },
        mealQueries: [ ...state.mealQueries, '' ],
        mealSuggestions: [ ...state.mealSuggestions, [] ],
      };

    case 'REMOVE_EVENT':
      console.log(`REMOVE_EVENT called with ${JSON.stringify(action)}`)
      return { ...state, mealPlan: { ...state.mealPlan, events: state.mealPlan.events.filter((_, index) => index !== action.eventIndex) } };

    case 'SET_MEAL_QUERY':
      return { ...state, mealQueries: state.mealQueries.map((query, index) => index === action.eventIndex ? action.query : query) };

    default:
      return state;
  }
};

/* END Meal Plan Creation Reducer */

function buildInitialMealPlanEvent(): MealPlanEventCreationRequestInput {
  const d = new Date();
  const nm = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  return new MealPlanEventCreationRequestInput({
    mealName: 'dinner',
    startsAt: formatISO(nm),
    endsAt: formatISO(addHours(nm, 1)),
  });
}

function buildInitialMealPlan(): MealPlanCreationRequestInput {
  const d = new Date();
  const nm = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  return new MealPlanCreationRequestInput({
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

const determineMinDate = (input: MealPlanCreationRequestInput, index: number): Date => {
  const d = new Date();
  let minDate = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  if ((input.events || []).length > 1 && index !== 0) {
    const lastEvent = input.events[input.events.length - 1];
    minDate = new Date(lastEvent.endsAt);
  }

  return minDate;
};

export default function NewMealPlanPage(): JSX.Element {
  const apiClient = buildLocalClient();

  const [pageState, dispatchMealPlanUpdate] = useReducer(useMealCreationReducer, new MealPlanCreationPageState());

  const mealPlanEvents = pageState.mealPlan.events.map((event: MealPlanEventCreationRequestInput, index: number) => {
    let minDate = determineMinDate(pageState.mealPlan, index);

    return (
      <Container key={`${event.mealName} on ${dayOfTheWeek(event)}`}>
        <Grid justify="space-between">
          <Grid.Col span={3}>{/* this left intentionally blank */}</Grid.Col>
          <Grid.Col span={3}>
            <CloseButton
              size="xs"
              onClick={() => dispatchMealPlanUpdate({ type: 'REMOVE_EVENT', eventIndex: index })}
              style={{ float: 'right' }}
              disabled={pageState.mealPlan.events.length === 1}
              color={pageState.mealPlan.events.length === 1 ? 'gray' : 'red'}
            />
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={1}>
          <Select
            label="Meal"
            placeholder="Pick one"
            value={event.mealName}
            disabled
            data={[{ value: 'dinner', label: 'Dinner' }]}
            onChange={(value: string) => {}}
          />

          <Grid>
            <Grid.Col span={6}>
              <TimeInput
                label="Pick time"
                format="12"
                disabled
                defaultValue={new Date(0, 0, 0, 18, 0, 0, 0)}
                onChange={(value: Date) => dispatchMealPlanUpdate({ type: 'SET_EVENT_START_TIME', eventIndex: index, newStartTime: formatISO(value) })}
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
                onChange={(value: Date) => dispatchMealPlanUpdate({ type: 'SET_EVENT_START_DATE', eventIndex: index, newStartDate: formatISO(value) })}
              />
            </Grid.Col>
          </Grid>

          <Autocomplete
            value={pageState.mealQueries[index]}
            onChange={(value: string) => dispatchMealPlanUpdate({ type: 'SET_MEAL_QUERY', eventIndex: index, query: value })}
            required
            limit={20}
            label="Meal name"
            placeholder="Baba Ganoush"
            dropdownPosition="bottom"
            onItemSubmit={(item: AutocompleteItem) => {
              console.log(item);
            }}
            data={pageState.mealSuggestions[index].map((x: Meal) => ({ value: x.name, label: x.name }))}
          />
        </SimpleGrid>
      </Container>
    );
  });

  return (
    <AppLayout>
      <Head>
        <title>Prixfixe - New Meal Plan</title>
      </Head>
      <Grid justify="space-between">
        <Grid.Col span={3} mb={6}>
          {(pageState.mealPlan.events.length < 5 && (
            <Button
              onClick={() => dispatchMealPlanUpdate({ type: 'ADD_EVENT' })}
            >
              Add Event
            </Button>
          )) || (
            // if this isn't here, the page will collapse upwards when you add a 7th event
            <Space h="xl" />
          )}
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
