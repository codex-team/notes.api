import type { Note, NotePublicId } from '@domain/entities/note.js';
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
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } note
   */
  public async getNoteById(id: NotePublicId): Promise<Note | null> {
    return await this.repository.getNoteByPublicId(id);
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
