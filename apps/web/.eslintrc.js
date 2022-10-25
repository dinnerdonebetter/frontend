module.exports = {
  root: true,
  extends: ['custom'],
  plugins: ['turbo'],
  rules: {
    // Automatically flag env vars missing from turbo.json
    'turbo/no-undeclared-env-vars': 'off',
  },
};
