import type { Note } from '@domain/entities/note.js';
import type NoteRelationshipRepository from '@repository/noteRelationship.repository.js';

/**
 * Note relationship service
 */
export default class NoteRelationshipService {
  /**
   * Note relationship repository
   */
  public repository: NoteRelationshipRepository;

  /**
   * Note relationship service constructor
   *
   * @param repository - note relationship repository
   */
  constructor(repository: NoteRelationshipRepository) {
    this.repository = repository;
  }

  /**
   * Adds note relationship
   *
   * @param noteId - id of the current note
   * @param parentId - id of the parent note
   */
  public async addNoteRelation(noteId: Note['id'], parentId: Note['id']): Promise<unknown> {
    return await this.repository.addNoteRelation(
      noteId,
      parentId
    );
  }
}
