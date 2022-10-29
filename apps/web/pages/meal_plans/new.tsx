import { MouseEventHandler, useEffect, useState } from 'react';
import { Card, Text, SimpleGrid, Title, Button, Center, CloseButton, UnstyledButton, Grid } from '@mantine/core';
import {
  intlFormat,
  nextMonday,
  addWeeks,
  addDays,
  subDays,
  addHours,
  subMinutes,
  isBefore,
  isAfter,
  formatISO,
} from 'date-fns';

import { MealPlanCreationRequestInput, MealPlanEventCreationRequestInput } from 'models';

import { AppLayout } from '../../src/layouts';

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

export default function NewMealPlanPage() {
  const [mealPlanInput, setMealPlanInput] = useState(new MealPlanCreationRequestInput());
  useEffect(() => setMealPlanInput(initializeMealPlan()), []);

  const addEvent = () => {
    const lastEvent = mealPlanInput.events[mealPlanInput.events.length - 1];
    const dt = new Date(lastEvent.endsAt);
    const nm = addDays(dt, 1);
    const newEvent = new MealPlanEventCreationRequestInput({
      mealName: 'dinner',
      startsAt: formatISO(nm),
      endsAt: formatISO(addHours(nm, 1)),
    });

    setMealPlanInput(
      new MealPlanCreationRequestInput({
        ...mealPlanInput,
        events: [...mealPlanInput.events, newEvent],
      }),
    );
  };

  const removeEvent = (index: number): MouseEventHandler<HTMLButtonElement> => {
    return () => {
      const newEvents = mealPlanInput.events.filter((_, i) => i !== index);
      if (newEvents.length === 0) {
        return;
      }

      setMealPlanInput(
        new MealPlanCreationRequestInput({
          ...mealPlanInput,
          events: newEvents,
        }),
      );
    };
  };

  const mealPlanEvents = mealPlanInput.events.map((event: MealPlanEventCreationRequestInput, index: number) => {
    const dt = new Date(event.startsAt);
    const dw = intlFormat(dt, {
      weekday: 'long',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
    });

    return (
      <Card key={`${event.mealName} on ${dw}`} withBorder radius="md">
        <Grid justify="space-between">
          <Grid.Col span={3}></Grid.Col>
          <Grid.Col span={3}>
            <UnstyledButton onClick={removeEvent(index)} style={{ float: 'right' }}>
              <CloseButton
                size="xs"
                disabled={mealPlanInput.events.length === 1}
                color={mealPlanInput.events.length === 1 ? 'gray' : 'red'}
              />
            </UnstyledButton>
          </Grid.Col>
        </Grid>

        <Text mt={4}>
          {event.mealName} on {dw}
        </Text>
      </Card>
    );
  });

  return (
    <AppLayout>
      <Title order={3}>New Meal Plan</Title>

      <SimpleGrid
        breakpoints={[
          { minWidth: 'md', cols: 1 },
          { minWidth: 'lg', cols: 7 },
        ]}
        spacing="lg"
      >
        {mealPlanEvents}

        {mealPlanInput.events.length < 7 && (
          <>
            <Card>
              <Center>
                <Button mt="md" onClick={addEvent}>
                  Add Event
                </Button>
              </Center>
            </Card>
          </>
        )}
      </SimpleGrid>
    </AppLayout>
  );
}
