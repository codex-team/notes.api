import CodeX from 'eslint-config-codex';
import { plugin as TsPlugin, parser as TsParser } from 'typescript-eslint';
/**
 * @todo connect architecture config
 */
export default [
  ...CodeX,
  {
    name: 'codex/codestyle/configs',
    files: ['eslint.config.mjs', 'vitest.config.js'],
    rules: {
      'n/no-unpublished-import': ['off'],
      '@typescript-eslint/naming-convention': ['off'],
    },
  },
  {
    name: 'codex/codestyle/dev-files',
    files: ['src/tests/**', '**/*.test.ts'],
    rules: {
      'n/no-unpublished-import': ['error', {
        allowModules: ['vitest'],
        ignoreTypeImport: true,
      }],
    },
  },
  {
    name: 'notex.api',
    ignores: ['vitest.config.js', 'eslint.config.mjs', 'src/tests/**', '**/*.test.ts'],
    plugins: {
      '@typescript-eslint': TsPlugin,
    },
    languageOptions: {
      parser: TsParser,
      parserOptions: {
        project: 'tsconfig.eslint.json',
        tsconfigRootDir: './',
        sourceType: 'module',
      },
    },
    rules: {
      'n/no-missing-import': ['off'],
      'n/no-unpublished-import': ['error'],
      'n/no-unsupported-features/es-builtins': ['error', {
        version: '>=22.1.0',
      }],
      '@typescript-eslint/naming-convention': ['error', {
        selector: 'property',
        format: ['camelCase', 'PascalCase'],

        filter: {
          regex: '^(?!(2xx|2[0-9][0-9]|application/json)$).*',
          match: true,
        },
      }],
      /**
       * @todo get rid of this rule ignores and solve all eslint errors occured
       */
      '@typescript-eslint/no-unsafe-member-access': ['off'],
      '@typescript-eslint/no-unsafe-call': ['off'],
      '@typescript-eslint/no-unsafe-assignment': ['off'],
      '@typescript-eslint/no-unsafe-return': ['off'],
      '@typescript-eslint/restrict-template-expressions': ['off'],
      'jsdoc/require-jsdoc': ['off'],
      'jsdoc/informative-docs': ['off'],
      'jsdoc/require-returns-description': ['off'],
      '@typescript-eslint/no-magic-numbers': ['off'],
      '@typescript-eslint/no-misused-promises': ['off'],
    },
  },
];
