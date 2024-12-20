import eslintConfigPrettier from 'eslint-config-prettier';
import eslint from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import tailwindcssPlugin from 'eslint-plugin-tailwindcss';
import importPlugin from 'eslint-plugin-import';

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    name: 'React-Internal ESLint config',
    files: ['**/*.tsx', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        allowDefaultProject: ['*.js'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      tailwindcss: tailwindcssPlugin,
      import: importPlugin,
      'import/parsers': tsParser,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          caughtErrors: 'none',
          varsIgnorePattern: '[iI]gnored',
          reportUsedIgnorePattern: true,
        },
      ],
    },
  },
  {
    ignores: ['*.js', 'dist/**'],
  },
];
