
import type { NotePublic } from './notePublic';

/**
 * Public Note list entity .
 * An object with the "items" property containing a list of all existing notes created by the user
 */
export type NoteListPublic = {
  items: NotePublic[];
};
