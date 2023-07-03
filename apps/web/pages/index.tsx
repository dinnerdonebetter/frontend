import React, { StrictMode, useState } from 'react';
import { Mermaid } from '../src/components';

import { AppLayout } from '../src/layouts';

export default function Web(): JSX.Element {
  const [chartDefinition, _setChartDefinition] = useState(`
graph TD;
  A --> B;
  A --> C;
  B --> D;
  C --> D;
  `);

  return (
    <StrictMode>
      <AppLayout title="" userLoggedIn={false}>
        <Mermaid chartDefinition={chartDefinition} />
        <>{/* TODO: get a home page screen, lol */}</>
      </AppLayout>
    </StrictMode>
  );
}
