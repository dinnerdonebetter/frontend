module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  plugins: ['unused-imports'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'off',
  },
};
