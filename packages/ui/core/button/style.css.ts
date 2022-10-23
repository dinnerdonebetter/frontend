import { style } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

export const baseButtonClass = style({
  color: 'white',
  fontFamily: ['sans-serif', 'Outfit'],
  textTransform: 'uppercase',
  fontWeight: 500,
  fontSize: '14px',
  width: `150px`,
  height: '50px',
  display: 'inline-block',
  padding: '16px',
  cursor: 'pointer',
  borderRadius: '5px',
  border: 'none',
});

const primaryButtonClass = style({
  'background': theme.color.primary800,
  ':hover': {
    background: theme.color.primary600,
  },
  ':disabled': {
    background: theme.color.primary600,
    cursor: 'not-allowed',
  },
});

const secondaryButtonClass = style({
  'background': theme.color.secondary800,
  ':hover': {
    background: theme.color.secondary600,
  },
  ':disabled': {
    background: theme.color.secondary600,
    cursor: 'not-allowed',
  },
});

const neutralButtonClass = style({
  'background': theme.color.neutral800,
  ':hover': {
    background: theme.color.neutral600,
  },
  ':disabled': {
    background: theme.color.neutral600,
    cursor: 'not-allowed',
  },
});

const successButtonClass = style({
  'background': theme.color.success800,
  ':hover': {
    background: theme.color.success600,
  },
  ':disabled': {
    background: theme.color.success600,
    cursor: 'not-allowed',
  },
});

const warningButtonClass = style({
  'background': theme.color.warning800,
  ':hover': {
    background: theme.color.warning600,
  },
  ':disabled': {
    background: theme.color.warning600,
    cursor: 'not-allowed',
  },
});

const dangerButtonClass = style({
  'background': theme.color.error800,
  ':hover': {
    background: theme.color.error600,
  },
  ':disabled': {
    background: theme.color.error600,
    cursor: 'not-allowed',
  },
});

export const buttonStyles: Record<string, string> = {
  primary: primaryButtonClass,
  secondary: secondaryButtonClass,
  neutral: neutralButtonClass,
  success: successButtonClass,
  warning: warningButtonClass,
  danger: dangerButtonClass,
};