import type { Note } from '@domain/entities/note.js';

/**
 * Note list  entity
 */
export type NoteList = {
  items: Note[];
};
