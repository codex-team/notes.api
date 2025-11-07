import type { Note, NoteCreationAttributes, NoteInternalId, NotePublicId, NotePreview } from '@domain/entities/note.js';
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
   * @param storage - storage for note
   */
  constructor(storage: NoteStorage) {
    this.storage = storage;
  }

  /**
   * Add note
   * @param options - note adding options
   * @returns added note
   */
  public async addNote(options: NoteCreationAttributes): Promise<Note> {
    return await this.storage.createNote(options);
  }

  /**
   * Update note content in a store
   * @param id - note internal id
   * @param content - new content
   * @param noteTools - tools which are used in note
   * @returns Note on success, null on failure
   */
  public async updateNoteContentAndToolsById(id: NoteInternalId, content: Note['content'], noteTools: Note['tools']): Promise<Note | null> {
    return await this.storage.updateNoteContentAndToolsById(id, content, noteTools);
  }

  /**
   * Gets note by internal id
   * @param id - note id
   * @returns found note
   */
  public async getNoteById(id: NoteInternalId): Promise<Note | null> {
    return await this.storage.getNoteById(id);
  }

  /**
   * Deletes note by id
   * @param id - note id
   */
  public async deleteNoteById(id: NoteInternalId): Promise<boolean> {
    return await this.storage.deleteNoteById(id);
  }

  /**
   * Gets note by hostname
   * @param hostname - custom hostname
   * @returns found note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    return await this.storage.getNoteByHostname(hostname);
  }

  /**
   * Returns note by public id. Null if note does not exist.
   * @param publicId - public id
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note | null> {
    return await this.storage.getNoteByPublicId(publicId);
  }

  /**
   * Gets note list by creator id
   * @param id - note creator id
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   */
  public async getNoteListByUserId(id: number, offset: number, limit: number): Promise<Note[]> {
    return await this.storage.getNoteListByUserId(id, offset, limit);
  }

  /**
   * Gets note list created by user
   * @param creatorId - id of note creator
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   */
  public async getMyNoteList(creatorId: number, offset: number, limit: number): Promise<Note[]> {
    return await this.storage.getMyNoteList(creatorId, offset, limit);
  }

  /**
   * Get all notes based on their ids
   * @param noteIds : list of note ids
   * @returns an array of notes
   */
  public async getNotesByIds(noteIds: NoteInternalId[]): Promise<Note[]> {
    return await this.storage.getNotesByIds(noteIds);
  }

  /**
   * Get note and all of its children recursively
   * @param noteId - note id
   * @returns an array of NotePreview
   */
  public async getNoteTreeByNoteId(noteId: NoteInternalId): Promise<NotePreview[] | null> {
    return await this.storage.getNoteTreebyNoteId(noteId);
  }
}
