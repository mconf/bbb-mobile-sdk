/* eslint-disable func-names */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel', 'transform-remove-console', 'react-native-worklets/plugin'],
      },
    },
    plugins: ['react-native-worklets/plugin'],
  };
};
