module.exports = {
  env: {
    es2022: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    sourceType: 'module',
  },
  plugins: ['react', '@babel'],
  // .js and .ts files import .ts modules without an extension
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
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
    '**/socket-connection/**',

    // shared notes: the BlockNote editor is a web bundle with its own toolchain,
    // and editor-bundle.js is its generated single-line output
    '**/shared-notes-editor/**',
    '**/user-notes-screen/editor-bundle.js',

    // plugin API: its own package, with its own toolchain
    '**/plugin-api/**'
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
    'consistent-return': 'off',
    'react/no-array-index-key': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never', mjs: 'never', jsx: 'never', ts: 'never', tsx: 'never',
      },
    ],
  },
  overrides: [
    {
      // TypeScript: the rules above plus typescript-eslint's recommended rules (without
      // type information), with the core rules that do not understand types replaced
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-undef': 'off',
        'no-redeclare': 'off',
        'no-dupe-class-members': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': [
          'error',
          { allow: ['arrowFunctions', 'functions', 'methods'] },
        ],
        'default-param-last': 'off',
        '@typescript-eslint/default-param-last': 'error',
        'no-loop-func': 'off',
        '@typescript-eslint/no-loop-func': 'error',
        // the types say which props are optional; React 19 has no defaultProps for functions
        'react/require-default-props': 'off',
        'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }],
      },
    },
  ],
};
