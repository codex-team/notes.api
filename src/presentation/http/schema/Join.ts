
/** Join schema params for validation and serialization */
export const JoinSchemaParams = {
  $id: 'JoinSchemaParams',
  type: 'object',
  required: [ 'hash' ],
  properties: {
    hash: {
      type: 'string',
      pattern: '[a-zA-Z0-9-_]+',
      maxLength: 10,
      minLength: 10,
    },
  },
};


/** Join schema for response */
export const JoinSchemaResponse = {
  $id: 'JoinSchemaResponse',
  type: 'object',
  properties: {
    result: {
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
