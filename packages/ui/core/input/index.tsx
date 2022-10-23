declare interface InputProps {
    placeholder?: string;
}

export const Input = (props: InputProps) => {
  return <input placeholder={props.placeholder} />;
};
