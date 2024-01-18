import type { Note } from '@domain/entities/note.js';
import type NoteRelationsRepository from '@repository/noteRelations.repository.js';

/**
 * Note relationship service
 */
export default class NoteRelationsService {
  /**
   * Note relationship repository
   */
  public repository: NoteRelationsRepository;

  /**
   * Note relationship service constructor
   *
   * @param repository - note relationship repository
   */
  constructor(repository: NoteRelationsRepository) {
    this.repository = repository;
  }

  /**
   * Get parent note id by note id
   *
   * @param noteId - id of the current note
   */
  public async getParentNoteIdByNoteId(noteId: Note['id']): Promise<number | null> {
    return await this.repository.getParentNoteIdByNoteId(noteId);
  }
}
