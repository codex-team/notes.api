import type TeamStorage from '@repository/storage/team.storage.js';
import type { MemberRole, Team, TeamMember, TeamMemberCreationAttributes } from '@domain/entities/team.js';
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
   * Creates team member
   *
   * @param team - data for team creation
   * @returns created team
   */
  public async create(team: TeamMemberCreationAttributes): Promise<TeamMember> {
    return await this.storage.insert(team);
  }

  /**
   * Get user role in note by user id and note id
   * If user is not a member of note, return null
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<MemberRole | null> {
    return await this.storage.getUserRoleByUserIdAndNoteId(userId, noteId);
  }

  /**
   * Get all team members by note id
   *
   * @param noteId - note id to get all team members
   * @returns team relations
   */
  public async getByNoteId(noteId: NoteInternalId): Promise<Team> {
    return await this.storage.getMembersByNoteId(noteId);
  }

  /**
   * Remove team member by id
   *
   * @param id - team member id
   */
  public async removeMemberById(id: TeamMember['id']): Promise<boolean> {
    return await this.storage.removeTeamMemberById(id);
  }
  /**
   *
   * @param id - id of team member
   * @param noteId - note internal id
   * @param role - team member new role
   */
  public async patchMemberRoleByUserId(id: TeamMember['id'], noteId: NoteInternalId, role : MemberRole): Promise<TeamMember['role'] | null> {
    return await this.storage.patchMemberRoleById(id, noteId, role);
  }
}
