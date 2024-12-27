module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    eqeqeq: 'error',
    'react/no-unescaped-entities': 'off',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};
