import type { Note, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type NoteRepository from '@repository/note.repository.js';
import type NoteVisitsRepository from '@repository/noteVisits.repository.js';
import { createPublicId } from '@infrastructure/utils/id.js';
import { DomainError } from '@domain/entities/DomainError.js';
import type NoteRelationsRepository from '@repository/noteRelations.repository.js';
import type User from '@domain/entities/user.js';
import type { NoteList } from '@domain/entities/noteList.js';
import { isEmpty } from '@infrastructure/utils/empty.js';

/**
 * Note service
 */
export default class NoteService {
  /**
   * Note repository
   */
  public noteRepository: NoteRepository;

  /**
   * Note relationship repository
   */
  public noteRelationsRepository: NoteRelationsRepository;

  /**
   * Note visits repository
   */
  public noteVisitsRepository: NoteVisitsRepository;

  /**
   * Number of the notes to be displayed on one page
   * it is used to calculate offset and limit for getting notes that the user has recently opened
   */
  private readonly noteListPortionSize = 30;

  /**
   * Note service constructor
   *
   * @param noteRepository - note repository
   * @param noteRelationsRepository - note relationship repository
   * @param noteVisitsRepository - note visits repository
   */
  constructor(noteRepository: NoteRepository, noteRelationsRepository: NoteRelationsRepository, noteVisitsRepository: NoteVisitsRepository) {
    this.noteRepository = noteRepository;
    this.noteRelationsRepository = noteRelationsRepository;
    this.noteVisitsRepository = noteVisitsRepository;
  }

  /**
   * Adds note
   *
   * @param content - note content
   * @param creatorId - note creator
   * @param parentPublicId - parent note if exist
   * @param tools - editor tools that were used in a note content
   * @returns { Note } added note object
   */
  public async addNote(content: Note['content'], creatorId: Note['creatorId'], parentPublicId: Note['publicId'] | undefined, tools: Note['tools']): Promise<Note> {
    const note = await this.noteRepository.addNote({
      publicId: createPublicId(),
      content,
      creatorId,
      tools,
    });

    if (parentPublicId !== undefined) {
      const parentNote = await this.getNoteByPublicId(parentPublicId);

      if (parentNote === null) {
        throw new DomainError(`Incorrect parent note`);
      }

      await this.noteRelationsRepository.addNoteRelation(note.id, parentNote.id);
    }

    return note;
  }

  /**
   * @todo Build a note tree and delete all descendants of a deleted note
   */
  /**
   * Deletes note by id
   *
   * @param id - note internal id
   */
  public async deleteNoteById(id: NoteInternalId): Promise<boolean> {
    /**
     * @todo If the note has not been deleted,
     * we must reset the note_relations database to its original state
     */
    const hasRelation = await this.noteRelationsRepository.hasRelation(id);

    if (hasRelation) {
      const isNoteRelationsDeleted = await this.noteRelationsRepository.deleteNoteRelationsByNoteId(id);

      if (isNoteRelationsDeleted === false) {
        throw new DomainError(`Relation with noteId ${id} was not deleted`);
      }
    }

    const isNoteDeleted = await this.noteRepository.deleteNoteById(id);

    if (isNoteDeleted === false) {
      throw new DomainError(`Note with id ${id} was not deleted`);
    }

    return isNoteDeleted;
  }

  /**
   * Updates a note
   *
   * @param id - note internal id
   * @param content - new content
   * @param noteTools - tools which are used in note
   */
  public async updateNoteContentAndToolsById(id: NoteInternalId, content: Note['content'], noteTools: Note['tools']): Promise<Note> {
    const updatedNote = await this.noteRepository.updateNoteContentAndToolsById(id, content, noteTools);

    if (updatedNote === null) {
      throw new DomainError(`Note with id ${id} was not updated`);
    }

    return updatedNote;
  }

  /**
   * Unlink parent note from the current note
   *
   * @param noteId - id of note to unlink parent
   */
  public async unlinkParent(noteId: NoteInternalId): Promise<boolean> {
    return this.noteRelationsRepository.unlinkParent(noteId);
  }

  /**
   * Returns note by id
   *
   * @param id - note internal id
   */
  public async getNoteById(id: NoteInternalId): Promise<Note> {
    const note = await this.noteRepository.getNoteById(id);

    if (note === null) {
      throw new DomainError(`Note with id ${id} was not found`);
    }

    return note;
  }

  /**
   * Returns note by public id
   *
   * @param publicId - note public id
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note> {
    const note = await this.noteRepository.getNoteByPublicId(publicId);

    if (note === null) {
      throw new DomainError(`Note with public id ${publicId} was not found`);
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
    return await this.noteRepository.getNoteByHostname(hostname);
  }

  /**
   * Get parent note id by note id
   *
   * @param noteId - id of the current note
   */
  public async getParentNoteIdByNoteId(noteId: NoteInternalId): Promise<NoteInternalId | null> {
    return await this.noteRelationsRepository.getParentNoteIdByNoteId(noteId);
  }

  /**
   * Returns note list by creator id
   *
   * @param userId - id of the user
   * @param page - number of current page
   * @returns list of the notes ordered by time of last visit
   */
  public async getNoteListByUserId(userId: User['id'], page: number): Promise<NoteList> {
    const offset = (page - 1) * this.noteListPortionSize;

    return {
      items: await this.noteRepository.getNoteListByUserId(userId, offset, this.noteListPortionSize),
    };
  }

  /**
   * Update note relation
   *
   * @param noteId - id of the current note
   * @param parentPublicId - id of the new parent note
   */
  public async updateNoteRelation(noteId: NoteInternalId, parentPublicId: NotePublicId): Promise<boolean> {
    const parentNote = await this.noteRepository.getNoteByPublicId(parentPublicId);

    if (parentNote === null) {
      throw new DomainError(`Incorrect parent note`);
    }

    let parentNoteId: number | null = parentNote.id;

    /**
     * This loop checks for cyclic reference when updating a note's parent.
     */
    while (parentNoteId !== null) {
      if (parentNoteId === noteId) {
        throw new DomainError(`Forbidden relation. Note can't be a child of own child`);
      }

      parentNoteId = await this.noteRelationsRepository.getParentNoteIdByNoteId(parentNoteId);
    }

    return await this.noteRelationsRepository.updateNoteRelationById(noteId, parentNote.id);
  };

  /**
   * Raise domain error if tools, that are in note content are not specified in tools array
   *
   * @param tools - editor tools that were used in a note content
   * @param content - content of the note
   * @todo validate tool ids
   */
  public async validateNoteTools(tools : Note['tools'], content: Note['content'] | Record<string, never>): Promise<void> {
    if (isEmpty(content) && (isEmpty(tools))) {
      return;
    }

    /**
     * Set of the tools that are used in note
     */
    const toolsInContent = Array.from(new Set(content.blocks.map(block => block.type)));

    /**
     * Tools that are specified in tools array
     */
    const passedTools = tools.map(tool => tool.name);

    /**
     * Check that all tools used in note are specified in toolsInContent array
     */
    const toolsAreSpicified = toolsInContent.every((toolName) => {
      return (passedTools.includes(toolName));
    });

    if (!toolsAreSpicified) {
      throw (new DomainError('Incorrect tools passed'));
    }

    /**
     * Extra tools specified
     */
    if (tools.length !== toolsInContent.length) {
      throw (new DomainError('Incorrect tools passed'));
    }
  }
}
