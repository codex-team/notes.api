/**
 * User entity used for validation and serialization
 */
export const UserSchema  = {
  $id: 'User',
  type: 'object',
  required: ['email', 'name'],
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    photo: { type: 'string' },
  },
  editorTools: {
    type: 'array',
    description: 'List of editor tools ids installed by user from Marketplace',
    items: {
      type: 'string',
    },
  },
};
