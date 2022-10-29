import { Container, Title } from '@mantine/core';

import { AppLayout } from '../../../src/layouts';

export default function UserSettingsPage() {
  return (
    <AppLayout>
      <Container size="xs">
        <Title order={3}>User Settings</Title>
      </Container>
    </AppLayout>
  );
}
