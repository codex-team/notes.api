import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteRelationshipStorage from '@repository/storage/noteRelationshp.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteRelationshipRepository {
  /**
   * Note relationship storage instance
   */
  public storage: NoteRelationshipStorage;

  /**
   * Note relationship repository constructor
   *
   * @param storage - storage for note relationship
   */
  constructor(storage: NoteRelationshipStorage) {
    this.storage = storage;
  }

  /**
   * Add note relation
   *
   * @param noteId - id of the current note
   * @param parentId - id of the parent note
   */
  public async addNoteRelation(noteId: NoteInternalId, parentId: NoteInternalId): Promise<void> {
    await this.storage.createNoteRelation(noteId, parentId);
  }
}
