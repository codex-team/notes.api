import Note from '@domain/entities/note.js';
import type NoteRepository from '@repository/note.repository.js';
import type NotesSettings from '@domain/entities/notesSettings.js';

/**
 * Note service
 */
export default class NoteService {
  /**
   * Note repository
   */
  public repository: NoteRepository;

  /**
   * Note service constructor
   *
   * @param repository - note repository
   */
  constructor(repository: NoteRepository) {
    this.repository = repository;
  }

  /**
   * Adds note
   *
   * @param title - note title
   * @param content - note content
   * @returns { Note } added note object
   */
  public async addNote(title: string, content: JSON): Promise<Note> {
    const note = new Note(title, content);

    const addedNote = await this.repository.addNote(note);

    return {
      id: addedNote.id,
      title: addedNote.title,
      content: addedNote.content,
    };
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } note
   */
  public async getNoteById(id: string): Promise<Note | null> {
    return await this.repository.getNoteByPublicId(id);
  }

  /**
   * Gets note settings by note id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } note settings
   */
  public async getNoteSettingsByNoteId(id: number): Promise<NotesSettings> {
    return await this.repository.getNoteSettingsByNoteId(id);
  }

  /**
   * Gets note by custom hostname
   *
   * @param hostname - hostname
   * @returns { Promise<Note | null> } note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    return await this.repository.getNoteByHostname(hostname);
  }
}
