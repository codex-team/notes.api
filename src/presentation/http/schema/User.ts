/**
 * User entity used for validation and serialization
 */
export const UserSchema = {
  $id: 'UserSchema',
  type: 'object',
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    name: { type: 'string' },
    photo: { type: 'string' },
    editorTools: {
      type: 'array',
      description: 'List of editor tools ids installed by user from Marketplace',
      items: {
        type: 'string',
      },
    },
  },
};
