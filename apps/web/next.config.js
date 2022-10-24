const withTM = require("next-transpile-modules")(["ui", "models", "api-client"]);

module.exports = withTM({
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ANALYTICS_ID: "https://api.prixfixe.dev",
  },
});
