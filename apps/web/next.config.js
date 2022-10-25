const withTM = require('next-transpile-modules')(['ui', 'models', 'api-client']);

module.exports = withTM({
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_ENDPOINT: 'https://api.prixfixe.dev',
  },
});
