import type { Note, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type NoteRepository from '@repository/note.repository.js';
import { createPublicId } from '@infrastructure/utils/id.js';

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
   * @param content - note content
   * @param creatorId - note creator
   * @returns { Note } added note object
   */
  public async addNote(content: JSON, creatorId: Note['creatorId']): Promise<Note> {
    return await this.repository.addNote({
      publicId: createPublicId(),
      content,
      creatorId,
    });
  }

  /**
   * Updates note
   *
   * @param id - note id
   * @param content - new content
   * @returns updated note
   * @throws { Error } if note was not updated
   */
  public async updateNoteContentByPublicId(id: NotePublicId, content: Note['content']): Promise<Note> {
    const updatedNote = await this.repository.updateNoteContentByPublicId(id, content);

    if (updatedNote === null) {
      throw new Error(`Note with id ${id} was not updated`);
    }

    return updatedNote;
  }

  /**
   * Returns note by id
   *
   * @param id - note internal id
   */
  public async getNoteById(id: NoteInternalId): Promise<Note> {
    const note = await this.repository.getNoteById(id);

    if (note === null) {
      throw new Error(`Note with id ${id} was not found`);
    }

    return note;
  }

  /**
   * Returns note by public id
   *
   * @param publicId - note public id
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note> {
    const note = await this.repository.getNoteByPublicId(publicId);

    if (note === null) {
      throw new Error(`Note with public id ${publicId} was not found`);
    }

    return note;
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
