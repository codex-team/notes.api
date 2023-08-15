import { nanoid } from 'nanoid';

/**
 * Creates public id visible for users
 * Used to access a Note via API
 *
 * @param length - length of public id
 */
export function createPublicId(length: number = 10): string {
  return nanoid(length);
}
