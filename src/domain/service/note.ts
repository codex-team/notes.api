import type { Note, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type NoteRepository from '@repository/note.repository.js';
import type NoteVisitsRepository from '@repository/noteVisits.repository.js';
import { createPublicId } from '@infrastructure/utils/id.js';
import { DomainError } from '@domain/entities/DomainError.js';
import type NoteRelationsRepository from '@repository/noteRelations.repository.js';
import type EditorToolsRepository from '@repository/editorTools.repository.js';
import type User from '@domain/entities/user.js';
import type { NoteList } from '@domain/entities/noteList.js';
import type NoteHistoryRepository from '@repository/noteHistory.repository.js';
import type { NoteHistoryMeta, NoteHistoryRecord, NoteHistoryPublic } from '@domain/entities/noteHistory.js';
import type TeamRepository from '@repository/team.repository.js';

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
   * Edtor tools repository
   */
  public editorToolsRepository: EditorToolsRepository;

  /**
   * Note history repository
   */
  public noteHistoryRepository: NoteHistoryRepository;

  /**
   * Team repository
   */
  public teamRepository: TeamRepository;

  /**
   * Number of the notes to be displayed on one page
   * it is used to calculate offset and limit for getting notes that the user has recently opened
   */
  private readonly noteListPortionSize = 30;

  /**
   * Constant used for checking that content changes are valuable enough to save updated note content to the history
   */
  private readonly valuableContentChangesLength = 100;

  /**
   * Note service constructor
   * @param noteRepository - note repository
   * @param noteRelationsRepository - note relationship repository
   * @param noteVisitsRepository - note visits repository
   * @param editorToolsRepository - editor tools repositoryn
   * @param noteHistoryRepository - note history repository
   * @param teamRepository - team note repository
   */
  constructor(noteRepository: NoteRepository, noteRelationsRepository: NoteRelationsRepository, noteVisitsRepository: NoteVisitsRepository, editorToolsRepository: EditorToolsRepository, noteHistoryRepository: NoteHistoryRepository, teamRepository: TeamRepository) {
    this.noteRepository = noteRepository;
    this.noteRelationsRepository = noteRelationsRepository;
    this.noteVisitsRepository = noteVisitsRepository;
    this.editorToolsRepository = editorToolsRepository;
    this.noteHistoryRepository = noteHistoryRepository;
    this.teamRepository = teamRepository;
  }

  /**
   * Adds note
   * @param content - note content
   * @param creatorId - note creator
   * @param parentPublicId - parent note if exist
   * @param tools - editor tools that were used in a note content
   * @returns added note object
   */
  public async addNote(content: Note['content'], creatorId: Note['creatorId'], parentPublicId: Note['publicId'] | undefined, tools: Note['tools']): Promise<Note> {
    const note = await this.noteRepository.addNote({
      publicId: createPublicId(),
      content,
      creatorId,
      tools,
    });

    /**
     * First note save always goes to the note history
     */
    await this.noteHistoryRepository.createNoteHistoryRecord({
      content,
      userId: creatorId,
      noteId: note.id,
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

    /**
     * Delete all note history records on note deletion
     */
    await this.noteHistoryRepository.deleteNoteHistoryByNoteId(id);

    const isNoteDeleted = await this.noteRepository.deleteNoteById(id);

    if (isNoteDeleted === false) {
      throw new DomainError(`Note with id ${id} was not deleted`);
    }

    return isNoteDeleted;
  }

  /**
   * Updates a note
   * @param id - note internal id
   * @param content - new content
   * @param noteTools - tools which are used in note
   * @param userId - id of the user that made changes
   */
  public async updateNoteContentAndToolsById(id: NoteInternalId, content: Note['content'], noteTools: Note['tools'], userId: User['id']): Promise<Note> {
    /**
     * If content changes are valuable, they will be saved to note history
     */
    if (await this.areContentChangesSignificant(id, content)) {
      await this.noteHistoryRepository.createNoteHistoryRecord({
        content,
        userId: userId,
        noteId: id,
        tools: noteTools,
      });
    };

    const updatedNote = await this.noteRepository.updateNoteContentAndToolsById(id, content, noteTools);

    if (updatedNote === null) {
      throw new DomainError(`Note with id ${id} was not updated`);
    }

    return updatedNote;
  }

  /**
   * Unlink parent note from the current note
   * @param noteId - id of note to unlink parent
   */
  public async unlinkParent(noteId: NoteInternalId): Promise<boolean> {
    return this.noteRelationsRepository.unlinkParent(noteId);
  }

  /**
   * Returns note by id
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
   * @param hostname - hostname
   * @returns note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    return await this.noteRepository.getNoteByHostname(hostname);
  }

  /**
   * Get parent note id by note id
   * @param noteId - id of the current note
   */
  public async getParentNoteIdByNoteId(noteId: NoteInternalId): Promise<NoteInternalId | null> {
    return await this.noteRelationsRepository.getParentNoteIdByNoteId(noteId);
  }

  /**
   * Returns note list by creator id
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
   * Create note relation
   * @param noteId - id of the current note
   * @param parentPublicId - id of the parent note
   */
  public async createNoteRelation(noteId: NoteInternalId, parentPublicId: NotePublicId): Promise<Note> {
    const currenParentNote = await this.noteRelationsRepository.getParentNoteIdByNoteId(noteId);

    /**
     * Check if the note already has a parent
     */
    if (currenParentNote !== null) {
      throw new DomainError(`Note already has parent note`);
    }

    const parentNote = await this.noteRepository.getNoteByPublicId(parentPublicId);

    if (parentNote === null) {
      throw new DomainError(`Incorrect parent note Id`);
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

    const isCreated = await this.noteRelationsRepository.addNoteRelation(noteId, parentNote.id);

    if (!isCreated) {
      throw new DomainError(`Relation was not created`);
    }

    return parentNote;
  }

  /**
   * Update note relation
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
   * @param tools - editor tools that were used in a note content
   * @param content - content of the note
   * @todo validate tool ids
   */
  public async validateNoteTools(tools: Note['tools'], content: Note['content'] | Record<string, never>): Promise<void> {
    /**
     * Set of the tools that are used in note
     */
    const toolsInContent = Array.from(new Set(content.blocks.map(block => block.type)));

    /**
     * Tools that are specified in tools array
     */
    const passedToolsNames = tools.map(tool => tool.name);
    const passedToolsIds = tools.map(tool => tool.id);
    /**
     * Check that all tools used in note are specified in toolsInContent array
     */
    const toolsAreSpicified = toolsInContent.every((toolName) => {
      return passedToolsNames.includes(toolName);
    });

    if (!toolsAreSpicified) {
      throw new DomainError('Incorrect tools passed');
    }

    /**
     * Extra tools specified
     */
    if (tools.length !== toolsInContent.length) {
      throw new DomainError('Incorrect tools passed');
    }

    /**
     * Validate tool ids
     */
    try {
      await this.editorToolsRepository.getToolsByIds(passedToolsIds);
    } catch {
      throw new DomainError('Incorrect tools passed');
    }
  }

  /**
   * Get note public id by it's internal id
   * Used for making entities that use NoteInternalId public
   * @param id - internal id of the note
   * @returns note public id
   */
  public async getNotePublicIdByInternal(id: NoteInternalId): Promise<NotePublicId> {
    const note = await this.noteRepository.getNoteById(id);

    if (note === null) {
      throw new DomainError(`Note with id ${id} was not found`);
    }

    return note.publicId;
  }

  /**
   * Check if content changes are valuable enough to save currently changed note to the history
   * The sufficiency of changes is determined by the length of the content change
   * @param noteId - id of the note that is currently changed
   * @param content - updated note content
   * @returns - boolean, true if changes are valuable enough, false otherwise
   */
  public async areContentChangesSignificant(noteId: NoteInternalId, content: Note['content']): Promise<boolean> {
    const currentlySavedNoteContent = (await this.noteHistoryRepository.getLastContentVersion(noteId));

    if (currentlySavedNoteContent === undefined) {
      throw new DomainError('No history for the note found');
    }

    const currentContentLength = currentlySavedNoteContent.blocks.reduce((length, block) => {
      length += JSON.stringify(block.data).length;

      return length;
    }, 0);

    const patchedContentLength = content.blocks.reduce((length, block) => {
      length += JSON.stringify(block.data).length;

      return length;
    }, 0);

    if (Math.abs(currentContentLength - patchedContentLength) >= this.valuableContentChangesLength) {
      return true;
    }

    return false;
  }

  /**
   * Get all note content change history metadata (without actual content)
   * Used for preview of all changes of the note content
   * @param noteId - id of the note
   * @returns - array of metadata of note changes history
   */
  public async getNoteHistoryByNoteId(noteId: Note['id']): Promise<NoteHistoryMeta[]> {
    return await this.noteHistoryRepository.getNoteHistoryByNoteId(noteId);
  }

  /**
   * Get concrete history record of the note
   * Used for showing some of the note content versions
   * @param id - id of the note history record
   * @returns full public note history record with user information or raises domain error if record not found
   */
  public async getHistoryRecordById(id: NoteHistoryRecord['id']): Promise<NoteHistoryPublic> {
    const noteHistoryRecord = await this.noteHistoryRepository.getHistoryRecordById(id);

    if (noteHistoryRecord === null) {
      throw new DomainError('This version of the note not found');
    }

    /**
     * Resolve note history record for it to be public
     * changes noteId from internal to public
     */
    const noteHistoryPublic = {
      id: noteHistoryRecord.id,
      noteId: await this.getNotePublicIdByInternal(noteHistoryRecord.noteId),
      userId: noteHistoryRecord.userId,
      content: noteHistoryRecord.content,
      tools: noteHistoryRecord.tools,
      createdAt: noteHistoryRecord.createdAt,
      user: noteHistoryRecord.user,
    };

    return noteHistoryPublic;
  }

  /**
   * Get note parent structure recursively by note id and user id
   * and check if user has access to the parent note.
   * @param noteId - id of the note to get parent structure
   * @param userId - id of the user that is requesting the parent structure
   * @returns - array of notes that are parent structure of the note
   */
  public async getNoteParentStructure(noteId: NoteInternalId, userId: number): Promise<NoteList> {
    return await this.noteRepository.getAllNotesParents(noteId, userId);
  }
}
