import type TeamStorage from '@repository/storage/team.storage.js';
import type { Team, TeamMember, TeamMemberCreationAttributes, MemberRole } from '@domain/entities/team.js';
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
   * Creates team member membership
   *
   * @param teamMembershipData - data for team membership creation
   * @returns created team membership
   */
  public async createTeamMembership(teamMembershipData: TeamMemberCreationAttributes): Promise<TeamMember> {
    return await this.storage.createTeamMembership(teamMembershipData);
  }

  /**
   * Check if user is note team member
   *
   * @param userId - user id to check
   * @param noteId - note id to identify team
   * @returns { Promise<boolean> } returns true if user is team member
   */
  public async isUserInTeam(userId: User['id'], noteId: NoteInternalId): Promise<boolean> {
    return await this.storage.isUserInTeam(userId, noteId);
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
   * Patch team member role by user and note id
   *
   * @param id - id of team member
   * @param noteId - note internal id
   * @param role - team member new role
   * @returns returns 1 if the role has been changed and 0 otherwise
   */
  public async patchMemberRoleByUserId(id: TeamMember['id'], noteId: NoteInternalId, role : MemberRole): Promise<MemberRole | null> {
    return await this.storage.patchMemberRoleById(id, noteId, role);
  }
}
