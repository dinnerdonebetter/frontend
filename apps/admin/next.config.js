const withTM = require('next-transpile-modules')(['ui', 'models', 'api-client']);

module.exports = withTM({
  reactStrictMode: true,
});
