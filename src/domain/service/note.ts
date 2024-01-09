import type { Note, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type NoteRepository from '@repository/note.repository.js';
import { createPublicId } from '@infrastructure/utils/id.js';
import type NoteRelationsRepository from '@repository/noteRelations.repository';

/**
 * Note service
 */
export default class NoteService {
  /**
   * Note repository
   */
  public repository: NoteRepository;

  public noteRelationsRepository: NoteRelationsRepository;

  /**
   * Note service constructor
   *
   * @param repository - note repository
   * @param noteRelationsRepository - note relationship service
   */
  constructor(repository: NoteRepository, noteRelationsRepository: NoteRelationsRepository) {
    this.repository = repository;
    this.noteRelationsRepository = noteRelationsRepository;
  }

  /**
   * Adds note
   *
   * @param content - note content
   * @param creatorId - note creator
   * @param parentPublicId - parent note if exist
   * @returns { Note } added note object
   */
  public async addNote(content: JSON, creatorId: Note['creatorId'], parentPublicId: Note['publicId'] | undefined): Promise<Note> {
    const note = await this.repository.addNote({
      publicId: createPublicId(),
      content,
      creatorId,
    });

    if (parentPublicId !== undefined) {
      const parentNote = await this.getNoteByPublicId(parentPublicId);

      if (parentNote === null) {
        throw new Error(`Note with id ${parentPublicId} was not found`);
      }

      await this.noteRelationsRepository.addNoteRelation(note.id, parentNote.id);
    }

    return note;
  }

  /**
   * Deletes note by id
   *
   * @param id - note internal id
   */
  public async deleteNoteById(id: NoteInternalId): Promise<boolean> {
    return await this.repository.deleteNoteById(id);
  }

  /**
   * Updates a note
   *
   * @param id - note internal id
   * @param content - new content
   * @param parentPublicId - parent note if exist
   */
  public async updateNoteContentById(id: NoteInternalId, content: Note['content'], parentPublicId: Note['publicId'] | undefined): Promise<Note> {
    const updatedNote = await this.repository.updateNoteContentById(id, content);

    if (updatedNote === null) {
      throw new Error(`Note with id ${id} was not updated`);
    }

    if (parentPublicId !== undefined) {
      const parentNote = await this.getNoteByPublicId(parentPublicId);

      if (parentNote === null) {
        if (parentNote === null) {
          throw new Error(`Note with id ${parentPublicId} was not found`);
        }
      }

      await this.noteRelationsRepository.updateNoteRelationById(updatedNote.id, parentNote.id);
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
