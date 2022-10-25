import './styles.css';

import type { AppProps } from 'next/app';
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import { customLightTheme, customDarkTheme } from '../src/themes';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <GeistProvider themes={[customLightTheme, customDarkTheme]} themeType="pfLight">
      <CssBaseline />
      <Component {...pageProps} />
    </GeistProvider>
  );
};

export default App;
