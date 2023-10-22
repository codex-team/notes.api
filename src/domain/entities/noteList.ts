import type { Note } from '@domain/entities/note.js';

/**
 * Note list  entity.
 * An object with the "items" property containing a list of all existing notes created by the user
 */
export type NoteList = {
  items: Note[];
};
