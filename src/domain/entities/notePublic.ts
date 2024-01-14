
import type { Note } from './note';

type NotePublicProperties = 'content' | 'createdAt' | 'updatedAt'| 'creatorId';

export interface NotePublic extends Pick<Note, NotePublicProperties> {
  /**
   * Expose public id as the "id" property
   */
  id: string;
}

