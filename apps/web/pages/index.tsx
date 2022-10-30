import { Container, Title } from '@mantine/core';

import { AppLayout } from '../src/layouts';

export default function Web() {
  return (
    <AppLayout>
      <Container size="xs">
        <Title order={3}>PrixFixe</Title>
      </Container>
    </AppLayout>
  );
}
