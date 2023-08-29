module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-flow'],
    env: {
      production: {
        plugins: ['react-native-paper/babel', 'transform-remove-console', 'react-native-reanimated/plugin'],
      },
    },
    plugins: ['react-native-reanimated/plugin'],
  };
};
