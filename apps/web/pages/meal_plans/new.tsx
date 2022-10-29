import { useEffect, useReducer } from 'react';
import {
  Card,
  Text,
  SimpleGrid,
  Button,
  CloseButton,
  UnstyledButton,
  Grid,
  Autocomplete,
  Space,
  Container,
  Select,
} from '@mantine/core';
import { intlFormat, nextMonday, addDays, addHours, subMinutes, formatISO } from 'date-fns';

import { MealPlanCreationRequestInput, MealPlanEventCreationRequestInput } from 'models';

import { AppLayout } from '../../src/layouts';
import { DatePicker, TimeInput } from '@mantine/dates';

class mealPlanBuilder {
  input: MealPlanCreationRequestInput;
  queries: string[];

  constructor() {
    const d = new Date();
    const nm = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));

    this.input = initializeMealPlan();
    this.queries = [];
  }
}

function initializeMealPlan(): MealPlanCreationRequestInput {
  const d = new Date();
  const nm = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
  return new MealPlanCreationRequestInput({
    notes: '',
    votingDeadline: subMinutes(nm, 30).toISOString(),
    events: [
      new MealPlanEventCreationRequestInput({
        mealName: 'dinner',
        startsAt: formatISO(nm),
        endsAt: formatISO(addHours(nm, 1)),
      }),
    ],
  });
}

type mealPlanCreatorStateActionType = 'ensureMinimumEvents' | 'changeMealQuery' | 'addEvent' | 'removeEvent';
declare interface mealPlanCreatorAction {
  type: mealPlanCreatorStateActionType;
  mealQuery?: string;
  eventIndex?: number;
  optionIndex?: number;
}

function reducer(mealPlanInput: MealPlanCreationRequestInput, action: mealPlanCreatorAction) {
  switch (action.type) {
    case 'ensureMinimumEvents':
      if (mealPlanInput.events.length === 0) {
        return initializeMealPlan();
      }
      return Object.assign({}, mealPlanInput, {});
    case 'changeMealQuery':
      console.log(action.mealQuery);
      return Object.assign({}, mealPlanInput, {});
    case 'addEvent':
      if (mealPlanInput.events.length === 0) {
        return initializeMealPlan();
      }

      const lastEvent = mealPlanInput.events[mealPlanInput.events.length - 1];
      const nm = addDays(new Date(lastEvent.endsAt), 1);
      const newEvent = new MealPlanEventCreationRequestInput({
        mealName: 'dinner',
        startsAt: formatISO(nm),
        endsAt: formatISO(addHours(nm, 1)),
      });

      return Object.assign({}, mealPlanInput, { events: [...mealPlanInput.events, newEvent] });
    case 'removeEvent':
      if (!action.eventIndex) {
        return Object.assign({}, mealPlanInput, {});
      }

      const newEvents = mealPlanInput.events.filter((_, i) => i !== action.eventIndex);
      return Object.assign({}, mealPlanInput, { events: newEvents });
    default:
      throw new Error();
  }
}

export default function NewMealPlanPage() {
  const [mealPlanInput, dispatch] = useReducer(reducer, new MealPlanCreationRequestInput());

  useEffect(() => {
    console.log('useEffect called to dispatch event');
    dispatch({ type: 'ensureMinimumEvents' });
  }, []);

  const mealPlanEvents = mealPlanInput.events.map((event: MealPlanEventCreationRequestInput, index: number) => {
    const dt = new Date(event.startsAt);
    const dw = intlFormat(dt, {
      weekday: 'long',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    });

    const d = new Date();
    let minDate = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
    if ((mealPlanInput.events || []).length > 1 && index !== 0) {
      const lastEvent = mealPlanInput.events[mealPlanInput.events.length - 1];
      minDate = new Date(lastEvent.endsAt);
      console.log(`minDate: ${minDate}`);
    }

    return (
      <Container key={`${event.mealName} on ${dw}`}>
        <Grid justify="space-between">
          <Grid.Col span={3}>{/* this Grid.Col left intentionally blank */}</Grid.Col>
          <Grid.Col span={3}>
            <CloseButton
              size="xs"
              onClick={() => dispatch({ type: 'removeEvent', eventIndex: index })}
              style={{ float: 'right' }}
              disabled={mealPlanInput.events.length === 1}
              color={mealPlanInput.events.length === 1 ? 'gray' : 'red'}
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
          />

          <Grid>
            <Grid.Col span={6}>
              <TimeInput label="Pick time" format="12" disabled defaultValue={new Date(0, 0, 0, 18, 0, 0, 0)} />
            </Grid.Col>
            <Grid.Col span={6}>
              <DatePicker
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
            // value={''}
            onChange={(mealQuery) => {
              dispatch({ type: 'changeMealQuery', eventIndex: index, mealQuery });
            }}
            required
            limit={20}
            label="Meal name"
            placeholder="Baba Ganoush"
            onItemSubmit={() => {}}
            data={[]}
          />
        </SimpleGrid>
      </Container>
    );
  });

  return (
    <AppLayout>
      <Grid justify="space-between">
        <Grid.Col span={3} mb={6}>
          {(mealPlanInput.events.length < 7 && (
            <Button onClick={() => dispatch({ type: 'addEvent' })}>Add Event</Button>
          )) || <Space h="xl" />}
        </Grid.Col>
      </Grid>

      <SimpleGrid
        breakpoints={[
          { minWidth: 'md', cols: 1 },
          { minWidth: 'lg', cols: 4 },
        ]}
        spacing="lg"
      >
        {mealPlanEvents}
      </SimpleGrid>
    </AppLayout>
  );
}
