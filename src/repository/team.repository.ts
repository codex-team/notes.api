import type TeamStorage from '@repository/storage/team.storage.js';
import type { Team, TeamCreationAttributes } from '@domain/entities/team.js';
import type { NoteInternalId } from '@domain/entities/note';
import type User from '@domain/entities/user';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class TeamRepository {
  /**
   * Team storage instance
   */
  public storage: TeamStorage;

  /**
   * Team repository constructor
   *
   * @param storage - storage for note
   */
  constructor(storage: TeamStorage) {
    this.storage = storage;
  }

  /**
   * Creates team relation
   *
   * @param team - data for team creation
   * @returns created team
   */
  public async create(team: TeamCreationAttributes): Promise<Team> {
    return await this.storage.insert(team);
  }

  /**
   * Get user role in note by user id and note id
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<string | null> {
    return await this.storage.getUserRoleByUserIdAndNoteId(userId, noteId);
  }

  /**
   * Get all team relations by note id
   *
   * @param noteId - note id to get all team relations
   * @returns team relations
   */
  public async getByNoteId(noteId: NoteInternalId): Promise<Team[]> {
    return await this.storage.getByNoteId(noteId);
  }

  /**
   * Remove team relation by id
   *
   * @param id - team relation id
   */
  public async removeRelationById(id: Team['id']): Promise<boolean> {
    return await this.storage.removeRelationById(id);
  }
}
