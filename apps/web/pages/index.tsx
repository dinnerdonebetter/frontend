import { StrictMode } from 'react';
import Head from 'next/head';
import { Container, Title } from '@mantine/core';

import { AppLayout } from '../src/layouts';

export default function Web(): JSX.Element {
  return (
    <StrictMode>
      <Head>
        <title>PrixFixe</title>
      </Head>
      <AppLayout>
        <Container size="xs">
          <Title order={5}>Obligatory home page</Title>
        </Container>
      </AppLayout>
    </StrictMode>
  );
}
