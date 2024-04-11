
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
  'overrides': [{
    'files': ['*.test.ts'],
    'rules': {
      '@typescript-eslint/no-magic-numbers': 'off'
    }
  }],
  'rules': {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'property',
        'format': ['camelCase', 'PascalCase'],
        'filter': {
          // Allow "2xx", "3xx", "5xx" as a property name, used in the API response schema
          'regex': '^(2xx|2\d{2}|5xx|3xx|application\/json)$',
          'match': false,
        },
      },
    ],
    'jsdoc/require-returns-type': "off"
  },
};
