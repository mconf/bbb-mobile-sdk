module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    sourceType: 'module',
  },
  plugins: ['react', '@babel'],
  ignorePatterns: [
    // build files
    '**/lib/**',
    '**/ios/**',
    '**/node_modules/**',
    '**/ios/**',
    '**/android/**',

    // services stuffs - WEBRTC/logger/api
    '**/src/services/**',

    // socket connection
    '**/socket-connection/**'
  ],
  rules: {
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.jsx', '.js'],
      },
    ],
    'import/prefer-default-export': 'off',
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],

    // disable annoying things
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'no-param-reassign': 'off',
    'react/react-in-jsx-scope': 'off',
    'arrow-body-style': 'off',
    'no-use-before-define': 'off',
    'global-require': 'off',
    'react/style-prop-object': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/jsx-no-bind': 'off',
    'no-nested-ternary': 'off',
    'no-underscore-dangle': 'off',
    'comma-dangle': 'off',
    'brace-style': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
