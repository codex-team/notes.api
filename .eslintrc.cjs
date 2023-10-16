
/* eslint-disable */
module.exports = {
  'extends': [
    'codex/ts',
  ],
  'plugins': [ 'vitest' ],
  'parserOptions': {
    'project': 'tsconfig.json',
    'tsconfigRootDir': __dirname,
    'sourceType': 'module',
  },
  'rules': {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'property',
        'format': ['camelCase', 'PascalCase'],
        'filter': {
          // Allow "2xx" as a property name, used in the API response schema
          'regex': '^(2xx)$',
          'match': false,
        },
      },
    ],
  },
};
