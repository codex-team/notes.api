export const JoinSchema = {
  '$id': 'JoinSchema',
  'type': 'object',
  'properties': {
    'hash': {
      type: 'string',
      pattern: '[a-zA-Z0-9-_]+',
      maxLength: 10,
      minLength: 10,
    },
    'result': {
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        noteId: {
          type: 'string',
          pattern: '[a-zA-Z0-9-_]+',
          maxLength: 10,
          minLength: 10,
        },
        userId: {
          type: 'number',
        },
        role: {
          type: 'number',
        },
      },
    },
  },
};
