const path = require('path');
const withTM = require('next-transpile-modules')([
  '@prixfixeco/models',
  '@prixfixeco/pfutils',
  '@prixfixeco/api-client',
]);

module.exports = withTM({
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_ENDPOINT: 'https://api.prixfixe.dev',
    NEXT_PUBLIC_SEGMENT_API_TOKEN: process.env.NEXT_PUBLIC_SEGMENT_API_TOKEN,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
});
