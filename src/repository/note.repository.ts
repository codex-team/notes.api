import type { Note, NoteCreationAttributes, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type NoteStorage from '@repository/storage/note.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteRepository {
  /**
   * Note storage instance
   */
  public storage: NoteStorage;

  /**
   * Note repository constructor
   *
   * @param storage - storage for note
   */
  constructor(storage: NoteStorage) {
    this.storage = storage;
  }

  /**
   * Add note
   *
   * @param options - note adding options
   * @returns { Promise<Note> } added note
   */
  public async addNote(options: NoteCreationAttributes): Promise<Note> {
    return await this.storage.createNote(options);
  }

  /**
   * Update note content in a store
   *
   * @param id - note internal id
   * @param content - new content
   */
  public async updateNoteContentById(id: NoteInternalId, content: Note['content'] ): Promise<Note | null> {
    return await this.storage.updateNoteContentById(id, content);
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteById(id: NoteInternalId): Promise<Note | null> {
    return await this.storage.getNoteById(id);
  }

  /**
   * Gets note by hostname
   *
   * @param hostname - custom hostname
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    return await this.storage.getNoteByHostname(hostname);
  }

  /**
   * Returns note by public id. Null if note does not exist.
   *
   * @param publicId - public id
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note | null> {
    return await this.storage.getNoteByPublicId(publicId);
  }
}
