import { Button, Input } from "ui";

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <Input placeholder="username" />
      <Input placeholder="password" />
      <Button text="Login" type="primary" />
    </div>
  );
}
