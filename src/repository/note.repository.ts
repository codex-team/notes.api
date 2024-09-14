import type { Note, NoteCreationAttributes, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type { NoteList } from '@domain/entities/noteList.js';
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
   * Get all notes parents based on note id and user id, by checking team access
   * @param noteId : note id to get all its parents
   * @param userId : user id to check access
   * @returns an array of note parents objects containing public id and content
   */
  public async getAllNotesParents(noteId: NoteInternalId, userId: number): Promise<NoteList> {
    return await this.storage.getAllNoteParents(noteId, userId);
  }
}
