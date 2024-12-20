import eslintConfigPrettier from 'eslint-config-prettier';
import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    name: 'Library ESLint config',
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      parserOptions: {
        allowDefaultProject: ['*.js'],
      },
    },
    plugins: {
      import: importPlugin,
      'import/parsers': tsParser,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts'],
      },
    },
    rules: {
      'no-useless-escape': 'off',
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
    ignores: ['*.js', 'dist'],
  },
];
