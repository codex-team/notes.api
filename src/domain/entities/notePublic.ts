import type { Note, NoteContent } from '@domain/entities/note.js';

type NotePublicProperties = 'content' | 'createdAt' | 'updatedAt' | 'creatorId' | 'cover';

export interface NotePublic extends Pick<Note, NotePublicProperties> {
  /**
   * Expose public id as the "id" property
   */
  id: string;
}

/**
 * Change Note to NotePublic
 * @param note - Note data to compose a public note
 */
export function definePublicNote(note: Note): NotePublic {
  const notePublic: NotePublic = {
    id: note.publicId,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    creatorId: note.creatorId,
    cover: note.cover,
  };

  return notePublic;
}

/**
 * Change Note to a trimmed NotePublic for list responses.
 * Content only includes the first block as a preview.
 * @param note - Note data to compose a note list item
 */
export function defineNoteListItem(note: Note): NotePublic {
  const trimmedContent: NoteContent = {
    blocks: note.content.blocks.slice(0, 1),
  };

  const notePublic: NotePublic = {
    id: note.publicId,
    content: trimmedContent,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    creatorId: note.creatorId,
    cover: note.cover,
  };

  return notePublic;
}