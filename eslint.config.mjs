import CodeX from '../eslint-config/index.js';
import ImportPlugin from 'eslint-import-resolver-alias';
/**
 * @todo connect architecture config
 */
export default [
  ...CodeX,
  {
    name: 'notex.api',
    rules: {
      'n/no-missing-import': ['error',
        {
          // tsconfigPath: './tsconfig.json',
          // resolvePaths: ['./src/infrastructure/*', './src/domain/*', './src/repository/*', './src/repository/storage/*', './node_modules/*'],
        }],
      'n/no-unpublished-import': ['error', {
        allowModules: ['vitest', 'postgres-migrations', 'eslint-import-resolver-alias'],
        ignoreTypeImport: true,
      }],
    },
    plugins: {
      ImportPlugin,
    },

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: '.',
        project: './tsconfig.json', // Автоматически находить tsconfig.json в рабочей директории
      },
    },

    settings: {
      'import/extensions': ['.js', '.ts', '.json'],
      'import/resolver': {
        tsconfig: {
          config: 'tsconfig.json',
          extensions: ['.js', '.ts', '.json'],
        },
      },
    },
  },
];
