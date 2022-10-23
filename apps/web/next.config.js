const withTM = require("next-transpile-modules")(["ui"]);

module.exports = withTM({
  reactStrictMode: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // config.module.rules.push({
    //   test: /\.(ts|js)x?$/,
    //   exclude: /node_modules/,
    //   use: {
    //     loader: 'babel-loader',
    //     options: {
    //       plugins: [
    //         "@babel/plugin-transform-react-jsx",
    //       //   "@babel/preset-env",
    //       //   "@babel/preset-react",
    //       //   "@babel/preset-typescript",
    //       ],
    //     },
    //   },
    // });

    // Important: return the modified config
    return config
  },
});
