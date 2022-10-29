import { Container, Title } from '@mantine/core';

import { AppLayout } from '../../src/layouts';

export default function NewMealPlanPage() {
  return (
    <AppLayout>
      <Container size="xs">
        <Title order={3}>New Meal Plan</Title>
      </Container>
    </AppLayout>
  );
}
