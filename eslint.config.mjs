import CodeX from 'eslint-config-codex';
import { plugin as TsPlugin, parser as TsParser } from 'typescript-eslint';
/**
 * @todo connect architecture config
 */
export default [
  ...CodeX,
  {
    name: 'notex.api',
    ignores: ['vitest.config.js', 'eslint.config.mjs'],
    plugins: {
      '@typescript-eslint': TsPlugin,
    },
    languageOptions: {
      parser: TsParser,
      parserOptions: {
        project: 'tsconfig.eslint.json', // Автоматически находить tsconfig.json в рабочей директории
        tsconfigRootDir: './',
        sourceType: 'module', // Allows for the use of imports
      },
    },
    rules: {
      'n/no-missing-import': ['off'],
      'n/no-unpublished-import': ['off'],
      // 'n/no-unpublished-import': ['error', {
      //   allowModules: ['vitest', '@testcontainers/localstack', 'postgres-migrations'],
      //   ignoreTypeImport: true,
      // }],
      'n/no-unsupported-features/es-builtins': ['error', {
        version: '>=22.1.0',
      }],
      '@typescript-eslint/naming-convention': ['error', {
        selector: 'property',
        format: ['camelCase', 'PascalCase'],

        filter: {
          regex: '^(?!(2xx|2[0-9][0-9]|application/json|VITE.*|HAWK.*)$).*',
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
