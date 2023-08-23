/**
 * User entity used for validation and serialization
 */
export const UserSchema = {
  $id: 'User',
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    name: { type: 'string' },
    photo: { type: 'string' },
  },
};
