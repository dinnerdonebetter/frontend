import { useEffect } from "react";

import pfClient from '../client';

export default function Login() {
  useEffect(()=> {
    login
  }, [])

  const login = async () => {
    pfClient.self();
  }

  return (
    <div>
      <form onSubmit={e => { e.preventDefault(); }}>
        <h1>Login</h1>
        <input id="usernameInput" placeholder="username" />
        <input id="passwordInput" placeholder="password" />
        <button>Login</button>
      </form>
    </div>
  );
}
