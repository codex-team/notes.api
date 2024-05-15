import CodeX from '../eslint-config/index.js';
/**
 * @todo connect architecture config
 */
export default [
  ...CodeX,
  {
    name: 'notex.api',
    rules: {
      'n/no-missing-import': ['off'],
      'n/no-unpublished-import': ['error', {
        allowModules: ['vitest', 'postgres-migrations', 'eslint-import-resolver-alias'],
        ignoreTypeImport: true,
      }],
    },

    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json', // Автоматически находить tsconfig.json в рабочей директории
        tsconfigRootDir: './',
        sourceType: 'module', // Allows for the use of imports
      },
    },
  },
];
