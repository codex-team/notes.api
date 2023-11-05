import type User from '@domain/entities/user.js';

/**
 * User list  entity
 * An object with the "items" property containing a list of all existing users
 */
export type UserList = {
  items: User[];
};