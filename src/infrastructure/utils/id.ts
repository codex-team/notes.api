import { nanoid } from 'nanoid';

/**
 * Creates public id visible for users
 * Used to access a Note via API
 * @param length - length of public id
 */
export function createPublicId(length: number = 10): string {
  return nanoid(length);
}

/**
 * Create unique identifier for editor tools
 * Used in editor tools and user settings
 * @param length - id length
 */
export function createEditorToolId(length: number = 8): string {
  return nanoid(length);
}

/**
 * Create unique identifier for file
 * @param length - id length
 */
export function createFileId(length: number = 8): string {
  return nanoid(length);
}
