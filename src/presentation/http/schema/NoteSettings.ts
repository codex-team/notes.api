/**
 * Note Settings entity used for validation and serialization
 */
export const NoteSettingsSchema = {
  $id: 'NoteSettingsSchema',
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    noteId: {
      type: 'number',
    },
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
    team: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          noteId: {
            type: 'number',
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
  },
};
