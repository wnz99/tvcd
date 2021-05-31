module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'implicit-arrow-linebreak': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': 'error',
    'operator-linebreak': [
      2,
      'before',
      { overrides: { '?': 'before', '=': 'after' } },
    ],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
  },
  settings: {
    'import/core-modules': ['rxjs/operators'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  env: {
    browser: true,
    jest: true,
  },
  globals: {
    cy: true,
    before: true,
  },
};
