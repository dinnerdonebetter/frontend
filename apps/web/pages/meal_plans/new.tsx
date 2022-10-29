import { useReducer } from 'react';
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
import { intlFormat, nextMonday, addDays, addHours, subMinutes, formatISO } from 'date-fns';

import { Meal, MealList, MealPlanCreationRequestInput, MealPlanEventCreationRequestInput } from 'models';

import { buildBrowserSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';
import { AxiosResponse } from 'axios';

class MealPlanEventBuilder {
  input: MealPlanEventCreationRequestInput;
  mealSuggestions: Meal[];
  mealAutocompleteSuggestions: AutocompleteItem[];

  constructor() {
    this.input = new MealPlanEventCreationRequestInput({ mealName: 'dinner' });
    this.mealSuggestions = [];
    this.mealAutocompleteSuggestions = [];
  }
}

class MealPlanBuilder {
  input: MealPlanCreationRequestInput;
  events: MealPlanEventBuilder[];

  constructor() {
    const eb = new MealPlanEventBuilder();
    eb.input = buildInitialMealPlanEvent();

    this.input = buildInitialMealPlan();
    this.events = [eb];
  }
}

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

type mealPlanCreatorStateActionType = 'updateMealQuery' | 'addEvent' | 'removeEvent';
declare interface mealPlanCreatorAction {
  type: mealPlanCreatorStateActionType;
  mealQuery?: string;
  eventIndex?: number;
  optionIndex?: number;
}

function reducer(mealPlanBuilder: MealPlanBuilder, action: mealPlanCreatorAction) {
  switch (action.type) {
    case 'updateMealQuery':
      let newBuilder = Object.assign({}, mealPlanBuilder, {});

      if (!action.mealQuery) {
        return newBuilder;
      }

      if (action.eventIndex == undefined || action.eventIndex < 0 || action.eventIndex >= newBuilder.events.length) {
        throw new Error('eventIndex is required');
      }

      if (action.mealQuery.length > 2) {
        const apiClient = buildBrowserSideClient();
        apiClient.searchForMeals(action.mealQuery).then((res: AxiosResponse<MealList>) => {
          newBuilder.events[action.eventIndex!].mealSuggestions = res.data.data;
          newBuilder.events[action.eventIndex!].mealAutocompleteSuggestions =
            newBuilder.events[action.eventIndex!].mealSuggestions.map(autocompleteItemFromMeal);
        });
      }

      return newBuilder;
    case 'addEvent':
      if (mealPlanBuilder.events.length === 0) {
        return Object.assign({}, mealPlanBuilder, { input: buildInitialMealPlan() });
      }

      const lastEvent = mealPlanBuilder.events[mealPlanBuilder.events.length - 1];
      const nm = addDays(new Date(lastEvent.input.endsAt), 1);
      const newEvent = new MealPlanEventBuilder();
      newEvent.input.startsAt = formatISO(nm);
      newEvent.input.endsAt = formatISO(addHours(nm, 1));

      const newEventUpdate = {
        events: [...mealPlanBuilder.events, newEvent],
      };

      return Object.assign({}, mealPlanBuilder, newEventUpdate);
    case 'removeEvent':
      if (
        action.eventIndex === undefined ||
        action.eventIndex < 0 ||
        action.eventIndex >= mealPlanBuilder.events.length
      ) {
        return Object.assign({}, mealPlanBuilder, {});
      }

      const newEvents = mealPlanBuilder.events.filter((_, i) => i !== action.eventIndex);
      return Object.assign({}, mealPlanBuilder, { events: newEvents });
    default:
      throw new Error('unsupported action type');
  }
}

const autocompleteItemFromMeal = (meal: Meal): AutocompleteItem => {
  const x = {
    label: meal.name,
    value: meal.id,
  };

  return x;
};

export default function NewMealPlanPage() {
  const [mealPlanBuilder, dispatch] = useReducer(reducer, new MealPlanBuilder());

  const mealPlanEvents = mealPlanBuilder.events.map((event: MealPlanEventBuilder, index: number) => {
    const dt = new Date(event.input.startsAt);
    const dw = intlFormat(dt, {
      weekday: 'long',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    });

    const d = new Date();
    let minDate = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
    if ((mealPlanBuilder.events || []).length > 1 && index !== 0) {
      const lastEvent = mealPlanBuilder.events[mealPlanBuilder.events.length - 1];
      minDate = new Date(lastEvent.input.endsAt);
    }

    return (
      <Container key={`${event.input.mealName} on ${dw}`}>
        <Grid justify="space-between">
          <Grid.Col span={3}>{/* this Grid.Col left intentionally blank */}</Grid.Col>
          <Grid.Col span={3}>
            <CloseButton
              size="xs"
              onClick={() => dispatch({ type: 'removeEvent', eventIndex: index })}
              style={{ float: 'right' }}
              disabled={mealPlanBuilder.events.length === 1}
              color={mealPlanBuilder.events.length === 1 ? 'gray' : 'red'}
            />
          </Grid.Col>
        </Grid>

        <SimpleGrid cols={1}>
          <Select
            label="Meal"
            placeholder="Pick one"
            value={event.input.mealName}
            disabled
            data={[{ value: 'dinner', label: 'Dinner' }]}
          />

          <Grid>
            <Grid.Col span={6}>
              <TimeInput label="Pick time" format="12" disabled defaultValue={new Date(0, 0, 0, 18, 0, 0, 0)} />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePicker
                value={new Date(event.input.startsAt)}
                placeholder="Pick date"
                label="Event date"
                withAsterisk
                initialLevel="date"
                clearable={false}
                minDate={minDate}
              />
            </Grid.Col>
          </Grid>

          <Autocomplete
            onChange={(mealQuery) => {
              dispatch({ type: 'updateMealQuery', eventIndex: index, mealQuery });
            }}
            required
            limit={20}
            label="Meal name"
            placeholder="Baba Ganoush"
            dropdownPosition="bottom"
            onItemSubmit={(item: AutocompleteItem) => {
              console.log(item);
            }}
            data={mealPlanBuilder.events[index].mealAutocompleteSuggestions}
          />
        </SimpleGrid>
      </Container>
    );
  });

  return (
    <AppLayout>
      <Grid justify="space-between">
        <Grid.Col span={3} mb={6}>
          {(mealPlanBuilder.events.length < 5 && (
            <Button onClick={() => dispatch({ type: 'addEvent' })}>Add Event</Button>
          )) || (
            // if this isn't here, the page will collapse upwards
            // when you add a 7th event
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
