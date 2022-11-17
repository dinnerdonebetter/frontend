import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
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
import { intlFormat, nextMonday, addHours, subMinutes, formatISO } from 'date-fns';
import Head from 'next/head';

import {
  Meal,
  MealList,
  MealPlanCreationRequestInput,
  MealPlanEvent,
  MealPlanEventCreationRequestInput,
} from '@prixfixeco/models';

import { buildBrowserSideClient } from '../../src/client';
import { AppLayout } from '../../src/layouts';

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

const autocompleteItemFromMeal = (meal: Meal): AutocompleteItem => {
  const x = {
    label: meal.name,
    value: meal.id,
  };

  return x;
};

const dayOfTheWeek = (event: MealPlanEvent | MealPlanEventCreationRequestInput): string => {
  return intlFormat(new Date(event.startsAt), {
    weekday: 'long',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hour12: true,
  });
};

export default function NewMealPlanPage(): JSX.Element {
  const [creationInput, setCreationInput] = useState(buildInitialMealPlan());
  const [mealQueries, setMealQueries] = useState([''] as string[]);
  const [mealSuggestions, setMealSuggestions] = useState([[]] as Meal[][]);
  const [mealAutocompleteSuggestions, setMealAutocompleteSuggestions] = useState([[]] as AutocompleteItem[][]);

  const apiClient = buildBrowserSideClient();

  const queryForMeals = (index: number): ((query: string) => void) => {
    return (mealQuery: string) => {
      const newQueries = [...mealQueries];
      newQueries[index] = mealQuery;
      setMealQueries(newQueries);

      const suggestionsCopy = [...mealSuggestions];
      if (mealQuery.length > 2) {
        apiClient.searchForMeals(mealQuery).then((res: AxiosResponse<MealList>) => {
          suggestionsCopy[index] = res.data?.data || [];
        });
      }

      setMealSuggestions(suggestionsCopy);
    };
  };

  useEffect(() => {
    const newSuggestions = mealSuggestions.map((mealSuggestionSet: Meal[]) => {
      return mealSuggestionSet.map(autocompleteItemFromMeal);
    });

    setMealAutocompleteSuggestions(newSuggestions);
  }, [mealSuggestions]);

  function setMealQuery(index: number): (_: string) => void {
    return (value: string) => {
      const newMealQueries = [...mealQueries];
      newMealQueries[index] = value;
      setMealQueries(newMealQueries);
    };
  }

  const determineMinDate = (input: MealPlanCreationRequestInput, index: number): Date => {
    const d = new Date();
    let minDate = nextMonday(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18));
    if ((input.events || []).length > 1 && index !== 0) {
      const lastEvent = input.events[input.events.length - 1];
      minDate = new Date(lastEvent.endsAt);
    }

    return minDate;
  };

  const mealPlanEvents = creationInput.events.map((event: MealPlanEventCreationRequestInput, index: number) => {
    let minDate = determineMinDate(creationInput, index);

    return (
      <Container key={`${event.mealName} on ${dayOfTheWeek(event)}`}>
        <Grid justify="space-between">
          <Grid.Col span={3}>{/* this Grid.Col left intentionally blank */}</Grid.Col>
          <Grid.Col span={3}>
            <CloseButton
              size="xs"
              onClick={() => {}}
              style={{ float: 'right' }}
              disabled={creationInput.events.length === 1}
              color={creationInput.events.length === 1 ? 'gray' : 'red'}
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
                value={new Date(event.startsAt)}
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
            value={mealQueries[index]}
            onChange={queryForMeals(index)}
            required
            limit={20}
            label="Meal name"
            placeholder="Baba Ganoush"
            dropdownPosition="bottom"
            onItemSubmit={(item: AutocompleteItem) => {
              console.log(item);
            }}
            data={mealAutocompleteSuggestions[index] || []}
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
          {(creationInput.events.length < 5 && (
            <Button
              onClick={() => {
                creationInput.addEvent();
                setCreationInput(creationInput);
              }}
            >
              Add Event
            </Button>
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
