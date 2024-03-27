import type { Note } from '@domain/entities/note.js';

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
 * @param note - Note data to compose a public note
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
