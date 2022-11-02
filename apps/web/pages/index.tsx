import { StrictMode } from 'react';
import { Container, Title } from '@mantine/core';

import { AppLayout } from '../src/layouts';

export default function Web() {
  return (
    <StrictMode>
      <AppLayout>
        <Container size="xs">
          <Title order={5}>Obligatory home page</Title>
        </Container>
      </AppLayout>
    </StrictMode>
  );
}
