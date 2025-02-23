import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteRelationshipStorage from '@repository/storage/noteRelations.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteRelationsRepository {
  /**
   * Note relationship storage instance
   */
  public storage: NoteRelationshipStorage;

  /**
   * Note relationship repository constructor
   * @param storage - storage for note relationship
   */
  constructor(storage: NoteRelationshipStorage) {
    this.storage = storage;
  }

  /**
   * Add note relation
   * @param noteId - id of the current note
   * @param parentId - id of the parent note
   */
  public async addNoteRelation(noteId: NoteInternalId, parentId: NoteInternalId): Promise<boolean> {
    return await this.storage.createNoteRelation(noteId, parentId);
  }

  /**
   * Update note relation
   * @param noteId - id of the current note
   * @param parentId - id of the parent note
   */
  public async updateNoteRelationById(noteId: NoteInternalId, parentId: NoteInternalId): Promise<boolean> {
    return await this.storage.updateNoteRelationById(noteId, parentId);
  }

  /**
   * Get parent note id by note id
   * @param noteId - id of the current note
   */
  public async getParentNoteIdByNoteId(noteId: NoteInternalId): Promise<number | null> {
    return await this.storage.getParentNoteIdByNoteId(noteId);
  }

  /**
   * Delete all note ralations contains noteId
   * @param noteId - id of the current note
   */
  public async deleteNoteRelationsByNoteId(noteId: NoteInternalId): Promise<boolean> {
    return await this.storage.deleteNoteRelationsByNoteId(noteId);
  }

  /**
   * Unlink parent note from the current note
   * @param noteId - id of note to unlink parent
   */
  public async unlinkParent(noteId: NoteInternalId): Promise<boolean> {
    return await this.storage.unlinkParent(noteId);
  }

  /**
   * Checks if the note has any connection
   * @param noteId - id of the current note
   */
  public async hasRelation(noteId: NoteInternalId): Promise<boolean> {
    return await this.storage.hasRelation(noteId);
  }

  /**
   * Get all note parents based on note id
   * @param noteId : note id to get all its parents
   * @returns an array of note parents ids
   */
  public async getNoteParentsIds(noteId: NoteInternalId): Promise<NoteInternalId[]> {
    return await this.storage.getNoteParentsIds(noteId);
  }

  /**
   * Get the ultimate parent of a note with note id
   * @param noteId - note id to get ultimate parent
   * @returns - note id of the ultimate parent
   */
  public async getUltimateParentNoteId(noteId: NoteInternalId): Promise<NoteInternalId | null> {
    return await this.storage.getUltimateParentByNoteId(noteId);
  }
}
