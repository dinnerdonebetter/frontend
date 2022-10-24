import { Themes } from '@geist-ui/core';

const common = {
  font: {
    sans: '"Outfit", "Helvetica", "Arial", "Verdana", "Tahoma", "Trebuchet MS", sans-serif',
  },
  palette: {
    // primary
    // background: "#",
    // accents_1: "#",
    // accents_2: "#",
    // accents_3: "#",
    // accents_4: "#",
    // accents_5: "#",
    // accents_6: "#",
    // accents_7: "#",
    // accents_8: "#",
    // foreground: "#",

    // success
    successLighter: '#edf1e9',
    successLight: '#adbf9b',
    success: '#5d8038',
    successDark: '#2a460e',

    // error
    errorLighter: '#f8e6e6',
    errorLight: '#e08e8e',
    error: '#c21e1e',
    errorDark: '#820000',

    // warning
    warningLighter: '#fef3e3',
    warningLight: '#f8c77f',
    warning: '#f18f01',
    warningDark: '#9b5c00',

    // cyan
    // cyanLighter: "#",
    // cyanLight: "#",
    // cyan: "#",
    // cyanDark: "#",

    // violet
    // violetLighter: "#",
    // violetLight: "#",
    // violet: "#",
    // violetDark: "#",

    // highlight
    // alert: "#",
    // purple: "#",
    // magenta: "#",

    // selection: "#",
    // secondary: "#ac2804",
    // code: "#",
    // border: "#445278",
    // link: "#",
  },
};

export const customLightTheme = Themes.createFromLight({
  type: 'pfLight',
  ...common,
});

export const customDarkTheme = Themes.createFromDark({
  type: 'pfDark',
  ...common,
});
