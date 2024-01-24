import type { NoteInternalId } from '@domain/entities/note.js';
import type { InvitationHash } from '@domain/entities/noteSettings.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type NoteSettingsRepository from '@repository/noteSettings.repository.js';
import type TeamRepository from '@repository/team.repository.js';
import type { Team, TeamMember, TeamMemberCreationAttributes } from '@domain/entities/team.js';
import { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';
import { createInvitationHash } from '@infrastructure/utils/invitationHash.js';
import { DomainError } from '@domain/entities/DomainError.js';

/**
 * Service responsible for Note Settings
 */
export default class NoteSettingsService {
  /**
   * Note Settings repository
   */
  public noteSettingsRepository: NoteSettingsRepository;

  private readonly teamRepository: TeamRepository;

  /**
   * Note Settings service constructor
   *
   * @param noteSettingsRepository - note settings repository
   * @param teamRepository - team repository
   */
  constructor(noteSettingsRepository: NoteSettingsRepository, teamRepository: TeamRepository) {
    this.noteSettingsRepository = noteSettingsRepository;
    this.teamRepository = teamRepository;
  }

  /**
   * Add user to the team by invitation hash
   *
   * @param invitationHash - hash for joining to the team
   * @param userId - user to add
   */
  public async addUserToTeamByInvitationHash(invitationHash: InvitationHash, userId: User['id']): Promise<TeamMember | null> {
    const defaultUserRole = MemberRole.read;
    const noteSettings = await this.noteSettingsRepository.getNoteSettingsByInvitationHash(invitationHash);

    /**
     * Check if invitation hash is valid
     */
    if (noteSettings === null) {
      throw new DomainError(`Wrong invitation`);
    }

    /**
     * Check if user not already in team
     */
    const isUserTeamMember = await this.teamRepository.isUserInTeam(userId, noteSettings.noteId);

    if (isUserTeamMember) {
      throw new DomainError(`User already in team`);
    }

    return await this.teamRepository.createTeamMembership({
      noteId: noteSettings.noteId,
      userId,
      role: defaultUserRole,
    });
  }

  /**
   * Returns settings for a note with passed id
   *
   * @param id - note internal id
   */
  public async getNoteSettingsByNoteId(id: NoteInternalId): Promise<NoteSettings> {
    const settings = await this.noteSettingsRepository.getNoteSettingsByNoteId(id);

    if (settings === null) {
      throw new DomainError(`Note settings not found`);
    }

    return settings;
  }

  /**
   * Adds note settings
   *
   * @param noteId - note id
   * @param isPublic - is note public
   * @returns added note settings
   */
  public async addNoteSettings(noteId: NoteInternalId, isPublic: boolean = true): Promise<NoteSettings> {
    return await this.noteSettingsRepository.addNoteSettings({
      noteId: noteId,
      isPublic: isPublic,
      invitationHash: createInvitationHash(),
    });
  }

  /**
   * Partially updates note settings
   *
   * @param noteId - note internal id
   * @param data - note settings data with new values
   * @returns updated note settings
   */
  public async patchNoteSettingsByNoteId(noteId: NoteInternalId, data: Partial<NoteSettings>): Promise<NoteSettings | null> {
    const noteSettings = await this.noteSettingsRepository.getNoteSettingsByNoteId(noteId);

    if (noteSettings === null) {
      throw new DomainError(`Note settings not found`);
    }

    return await this.noteSettingsRepository.patchNoteSettingsById(noteSettings.id, data);
  }

  /**
   * Get user role in team by user id and note id
   * If user is not a member of note, return null
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<MemberRole | null> {
    return await this.teamRepository.getUserRoleByUserIdAndNoteId(userId, noteId);
  }

  /**
   * Get all team members by note id
   *
   * @param noteId - note id to get all team members
   * @returns team members
   */
  public async getTeamByNoteId(noteId: NoteInternalId): Promise<Team> {
    return await this.teamRepository.getByNoteId(noteId);
  }

  /**
   * Get all team members by note id with info about users
   *
   * @param noteId - note id to get all team members
   * @returns team with additional info
   */
  public async getTeamWithUsersInfoByNoteId(noteId: NoteInternalId): Promise<Team> {
    return await this.teamRepository.getMembersWithUsersInfoByNoteId(noteId);
  }

  /**
   * Remove team member by id
   *
   * @param id - team member id
   */
  public async removeTeamMemberById(id: TeamMember['id']): Promise<boolean> {
    return await this.teamRepository.removeMemberById(id);
  }

  /**
   * Creates team member
   *
   * @param team - data for team member creation
   * @returns created team member
   */
  public async createTeamMember(team: TeamMemberCreationAttributes): Promise<TeamMember> {
    return await this.teamRepository.createTeamMembership(team);
  }

  /**
   * Updates invitation hash in note settings
   *
   * @param noteId - note internal id
   * @returns updated note settings
   */
  public async regenerateInvitationHash(noteId: NoteInternalId): Promise<NoteSettings> {
    /**
     * Generates a new invitation hash
     */
    const data = { invitationHash: createInvitationHash() };

    const updatedNoteSettings = await this.patchNoteSettingsByNoteId(noteId, data);

    if (updatedNoteSettings === null) {
      throw new DomainError(`Note settings was not updated`);
    }

    return updatedNoteSettings;
  }

  /**
   * Patch team member role by user and note id
   *
   * @param id - userId of team member
   * @param noteId - note internal id
   * @param role - new team member role
   * @returns returns 1 if the role has been changed and 0 otherwise
   */
  public async patchMemberRoleByUserId(id: TeamMember['id'], noteId: NoteInternalId, role: MemberRole): Promise<MemberRole | null> {
    return await this.teamRepository.patchMemberRoleByUserId(id, noteId, role);
  }
}
