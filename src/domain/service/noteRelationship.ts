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
   * @param parentId - id of the parent note, may be undefined if not passed
   */
  public async addNoteRelation(noteId: Note['id'], parentId: Note['id'] | undefined): Promise<boolean> {
    /**
     * If parent id not passed returned false - in this case the current note will not have a parent note field
     */
    if (parentId === undefined) {
      return false;
    }

    return await this.repository.addNoteRelation(
      noteId,
      parentId
    );
  }

  /**
   * Adds note relationship
   *
   * @param noteId - id of the current note
   * @param parentId - id of the parent note, may be undefined if not passed
   */
  public async updateNoteRelationById(noteId: Note['id'], parentId: Note['id'] | undefined): Promise<boolean> {
    /**
     * If parent id not passed returned false
     */
    if (parentId === undefined) {
      return false;
    }

    return await this.repository.updateNoteRelationById(
      noteId,
      parentId
    );
  }

  /**
   * Get parent note id by note id
   *
   * @param noteId - id of the current note
   */
  public async getParentNoteIdByNoteId(noteId: Note['id']): Promise<number | null> {
    return await this.repository.getParentNoteByNoteId(noteId);
  }
}
