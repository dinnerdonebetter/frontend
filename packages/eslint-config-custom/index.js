module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['unused-imports'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',

    'no-unused-vars': 'error', // or '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        'vars': 'all',
        'varsIgnorePattern': '_',
        'args': 'after-used',
        'argsIgnorePattern': '_'
      },
    ]

  },
};
