module.exports = {
  extends: [
    'eslint:recommended',
    'next/core-web-vitals',
    'prettier'
  ],
  rules: {
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'eqeqeq': 'error'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
} 