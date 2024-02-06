import type { NotePublic } from '@domain/entities/notePublic.js';

/**
 * Schema for the note response
 */
export interface NoteResponse {
  note: NotePublic;
  accessRights: {
    canEdit: boolean;
  };
}
