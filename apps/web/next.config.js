const path = require('path');
const withTM = require('next-transpile-modules')(['models', 'api-client']);

module.exports = withTM({
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_ENDPOINT: 'https://api.prixfixe.dev',
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
});
