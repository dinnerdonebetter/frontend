import { useState } from 'react';

import { baseTextInputClass } from './style.css';

declare interface InputProps {
  identifier: string;
  label?: string;
  placeholder?: string;
}

export const Input = (props: InputProps) => {
  const [value, rawSetValue] = useState("");

  function setValue(x: string): void {
    rawSetValue(x);
  }

  return <div>
    <label htmlFor={props.identifier}>{props.label}</label>
    <input
      id={props.identifier}
      className={baseTextInputClass}
      placeholder={props.placeholder ?? ''}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  </div>;
};
