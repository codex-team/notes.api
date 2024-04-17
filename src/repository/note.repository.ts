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
   * @returns Note on success, null on failure
   */
  public async updateNoteContentById(id: NoteInternalId, content: Note['content'] ): Promise<Note | null> {
    return await this.storage.updateNoteContentById(id, content);
  }

  /**
   * Gets note by internal id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteById(id: NoteInternalId): Promise<Note | null> {
    return await this.storage.getNoteById(id);
  }

  /**
   * Deletes note by id
   *
   * @param id - note id
   */
  public async deleteNoteById(id: NoteInternalId): Promise<boolean> {
    return await this.storage.deleteNoteById(id);
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

  /**
   * Gets note list by creator id
   *
   * @param id - note creator id
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   */
  public async getNoteListByUserId(id: number, offset: number, limit: number): Promise<Note[]> {
    return await this.storage.getNoteListByUserId(id, offset, limit);
  }

  /**
   * Updates tools list of certain note
   *
   * @param noteId - internal id of the note
   * @param noteTools - tools which are used in note
   */
  public async updateNoteToolsById(noteId: NoteInternalId, noteTools: Note['tools']): Promise<boolean> {
    return await this.storage.updateNoteToolsById(noteId, noteTools);
  };
}
