module.exports = {
  parser: 'babel-eslint',
  plugins: ['prettier'],
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'implicit-arrow-linebreak': 'off',
    'no-restricted-imports': [
      2,
      {
        paths: ['lodash'],
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
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
