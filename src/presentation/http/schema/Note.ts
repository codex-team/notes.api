/**
 * Note entity used for validation and serialization
 */
export const NoteSchema = {
  $id: 'NoteSchema',
  type: 'object',
  properties: {
    id: {
      'type': 'string',
      'pattern': '[a-zA-Z0-9-_]',
      'maxLength': 10,
      'minLength': 10,
    },
  },
};

export const NoteEditPayloadSchema = {
  $id: 'NoteOptionSchema',
  type: 'object',
  properties: {
    id: {
      '$ref': 'NoteSchema#/properties/id',
    },
    'content': {
      'type': 'object',
      'properties': {
        'time': {
          'type':'number',
        },
        'blocks': {
          'type':'array',
        },
        'version': {
          'type':'string',
        },
      },
    },
  },
};
