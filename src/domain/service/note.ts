import type Note from '@domain/entities/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import { nanoid } from 'nanoid';
import type NoteRepository from '@repository/note.repository.js';

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
   * @param creatorId - note creator
   * @returns { Note } added note object
   */
  public async addNote(title: string, content: JSON, creatorId: Note['creatorId']): Promise<Note> {
    return await this.repository.addNote({
      title,
      content,
      creatorId,
    });
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } note
   */
  public async getNoteById(id: NotesSettings['publicId']): Promise<Note | null> {
    return await this.repository.getNoteByPublicId(id);
  }

  /**
   * Gets note settings by public id
   *
   * @param id - note public id
   * @returns { Promise<NotesSettings | null> } note settings
   */
  public async getNoteSettingsByPublicId(id: NotesSettings['publicId']): Promise<NotesSettings> {
    return await this.repository.getNoteSettingsByPublicId(id);
  }

  /**
   * Gets note settings by note id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } note
   */
  public async getNoteSettingsByNoteId(id: Note['id']): Promise<NotesSettings | null> {
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

  /**
   * Adds note settings
   *
   * @param noteId - note id
   * @param enabled - is note enabled
   * @returns { Promise<NotesSettings> } note settings
   */
  public async addNoteSettings(noteId: Note['id'], enabled: boolean = true): Promise<NotesSettings> {
    const publicIdLength = 10;

    const publicId = nanoid(publicIdLength);

    return await this.repository.addNoteSettings({
      noteId: noteId,
      publicId: publicId,
      enabled: enabled,
    });
  }

  /**
   * Partially updates note settings
   *
   * @param data - note settings data with new values
   * @param noteId - note public id
   * @returns { Promise<NotesSettings> } updated note settings
   */
  public async patchNoteSettings(data: Partial<NotesSettings>, noteId: NotesSettings['publicId']): Promise<NotesSettings | null> {
    const noteSettings = await this.repository.getNoteSettingsByPublicId(noteId);

    return await this.repository.patchNoteSettings(data, noteSettings.id);
  }
}
