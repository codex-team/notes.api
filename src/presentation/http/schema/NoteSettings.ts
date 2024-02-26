/**
 * Note Settings entity used for validation and serialization
 */
export const NoteSettingsSchema = {
  $id: 'NoteSettingsSchema',
  type: 'object',
  properties: {
    customHostname: {
      type: 'string',
    },
    isPublic: {
      type: 'boolean',
      default: true,
    },
    invitationHash: {
      type: 'string',
      pattern: '[a-zA-Z0-9-_]+',
      maxLength: 10,
      minLength: 10,
    },
    cover: {
      type: 'string',
    },
    team: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          role: {
            type: 'number',
          },
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              photo: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
};
