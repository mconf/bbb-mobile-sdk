module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:flowtype/recommended',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@babel', 'flowtype'],
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

    // flow rules
    'flowtype/boolean-style': [
      2,
      'boolean',
    ],
    'flowtype/define-flow-type': 1,
    'flowtype/delimiter-dangle': [
      2,
      'never',
    ],
    'flowtype/generic-spacing': [
      2,
      'never',
    ],
    'flowtype/interface-id-match': [
      2,
      '^([A-Z][a-z0-9]+)+Type$',
    ],
    'flowtype/no-mixed': 2,
    'flowtype/no-primitive-constructor-types': 2,
    'flowtype/no-types-missing-file-annotation': 0,
    'flowtype/no-weak-types': 2,
    'flowtype/object-type-delimiter': [
      2,
      'comma',
    ],
    'flowtype/require-readonly-react-props': 0,
    'flowtype/require-valid-file-annotation': 2,
    'flowtype/semi': [
      2,
      'always',
    ],
    'flowtype/space-after-type-colon': [
      2,
      'always',
    ],
    'flowtype/space-before-generic-bracket': [
      2,
      'never',
    ],
    'flowtype/space-before-type-colon': [
      2,
      'never',
    ],
    'flowtype/type-id-match': [
      2,
      '^([A-Z][a-z0-9]+)+Type$',
    ],
    'flowtype/union-intersection-spacing': [
      2,
      'always',
    ],
    'flowtype/use-flow-type': 1,
    'flowtype/valid-syntax': 1,

    // review below
    'flowtype/require-parameter-type': 0,
    'flowtype/require-return-type': [
      0,
      'always',
      {
        annotateUndefined: 'never',
      },
    ],

    // disable annoying things
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'no-param-reassign': 'off',
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
    'arrow-body-style': 'off',
    'no-use-before-define': 'off',
    'global-require': 'off',
    'react/style-prop-object': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/jsx-no-bind': 'off',
    'no-nested-ternary': 'off',
    'no-underscore-dangle': 'off',
  },
};
