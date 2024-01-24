
import type { Note } from './note';

type NotePublicProperties = 'content' | 'createdAt' | 'updatedAt'| 'creatorId';

export interface NotePublic extends Pick<Note, NotePublicProperties> {
  /**
   * Expose public id as the "id" property
   */
  id: string;
}

/**
 *Change Note to NotePublic
 *
 * @param note - Note to change
 */
export function definePublicNote(note: Note): NotePublic {
  const notePublic: NotePublic = {
    id: note.publicId,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    creatorId: note.creatorId,
  };

  return notePublic;
}

