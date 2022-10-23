import { baseButtonClass, buttonStyles } from './style.css';

declare interface ButtonProps {
  text: string;
  type?: string;
}

export const Button = (props: ButtonProps) => {
  return <button className={`${baseButtonClass} ${buttonStyles[props.type ?? 'primary']}`} >{ props.text }</button>;
};
