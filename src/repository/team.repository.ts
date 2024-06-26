import type TeamStorage from '@repository/storage/team.storage.js';
import type { Team, TeamMember, TeamMemberCreationAttributes, MemberRole } from '@domain/entities/team.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import type User from '@domain/entities/user.js';

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
   * @param storage - storage for note
   */
  constructor(storage: TeamStorage) {
    this.storage = storage;
  }

  /**
   * Creates team member membership
   * @param teamMembershipData - data for team membership creation
   * @returns created team membership
   */
  public async createTeamMembership(teamMembershipData: TeamMemberCreationAttributes): Promise<TeamMember> {
    return await this.storage.createTeamMembership(teamMembershipData);
  }

  /**
   * Check if user is note team member
   * @param userId - user id to check
   * @param noteId - note id to identify team
   * @returns returns true if user is team member
   */
  public async isUserInTeam(userId: User['id'], noteId: NoteInternalId): Promise<boolean> {
    return await this.storage.isUserInTeam(userId, noteId);
  }

  /**
   * Get all team members by note id
   * @param noteId - note id to get all team members
   * @returns team relations
   */
  public async getInheritedTeamByNoteId(noteId: NoteInternalId): Promise<Team> {
    return await this.storage.getMembersByNoteId(noteId);
  }

  /**
   * Get all team members by note id with info about users
   * @param noteId - note id to get all team members
   * @returns team with additional info
   */
  public async getTeamMembersByNoteId(noteId: NoteInternalId): Promise<Team> {
    return await this.storage.getTeamMembersWithUserInfoByNoteId(noteId);
  };

  /**
   * Remove team member by id
   * @param userId - id of the team member
   * @param noteId - note internal id
   * @returns returns userId if team member was deleted and undefined overwise
   */
  public async removeTeamMemberByUserIdAndNoteId(userId: TeamMember['id'], noteId: NoteInternalId): Promise<User['id'] | undefined> {
    return await this.storage.removeTeamMemberByUserIdAndNoteId(userId, noteId);
  }

  /**
   * Patch team member role by user and note id
   * @param id - id of team member
   * @param noteId - note internal id
   * @param role - team member new role
   * @returns returns 1 if the role has been changed and 0 otherwise
   */
  public async patchMemberRoleByUserId(id: TeamMember['id'], noteId: NoteInternalId, role: MemberRole): Promise<MemberRole | undefined> {
    return await this.storage.patchMemberRoleById(id, noteId, role);
  }
}
