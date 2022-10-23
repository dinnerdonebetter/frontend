import { style } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

export const baseTextInputClass = style({
  'outline': 'none',
  'appearance': 'unset',
  'display': 'block',
  'width': '100%',
  'boxSizing': 'border-box',
  'border': `1px solid ${theme.color.primary500}`,
  'color': theme.color.primary900,
  'padding': theme.padding.inputs,
  'borderRadius': '5px',
  'fontSize': '14px',
  'fontFamily': theme.font.primary,
  ':focus': {
    outline: 'none',
    boxShadow: 'none !important',
    border: `1px solid ${theme.color.secondary700}`,
  },
});
