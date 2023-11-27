import type { Note } from '@domain/entities/note.js';
import type { NotePublic } from '@domain/entities/notePublic';

/**
 * Note list  entity.
 * An object with the "items" property containing a list of all existing notes created by the user
 */
export type NoteList = {
  items: Note[];
};

/**
 * Public Note list entity .
 * An object with list of public notes
 */
export type NoteListPublic = {
  items: NotePublic[];
};

