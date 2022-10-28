import { MantineProvider } from '@mantine/core';
import type { AppProps } from 'next/app';

import './styles.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <MantineProvider withCSSVariables>
      <Component {...pageProps} />
    </MantineProvider>
  );
};

export default App;
