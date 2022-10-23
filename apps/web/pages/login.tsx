import { useEffect } from "react";

import { Button, Input } from "ui";

import { baseContainerClass } from './login.css';

export default function Login() {
  useEffect(()=> {
    login
  }, [])

  const login = () => {

  }

  return (
    <div className={baseContainerClass}>
      <form onSubmit={e => { e.preventDefault(); }}>
        <h1>Login</h1>
        <Input identifier="usernameInput" label="username" placeholder="username" />
        <Input identifier="passwordInput" label="password" placeholder="password" />
        <Button text="Login" type="primary" />
      </form>
    </div>
  );
}
