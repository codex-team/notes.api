import type { NoteInternalId } from '@domain/entities/note.js';
import type { InvitationHash } from '@domain/entities/noteSettings.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type NoteSettingsRepository from '@repository/noteSettings.repository.js';
import type TeamRepository from '@repository/team.repository.js';
import type { Team, TeamMember, TeamMemberPublic, TeamMemberCreationAttributes } from '@domain/entities/team.js';
import { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';
import { createInvitationHash } from '@infrastructure/utils/invitationHash.js';
import { DomainError } from '@domain/entities/DomainError.js';
import type { SharedDomainMethods } from './shared/index.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import type { DomainLogger } from '@infrastructure/logging/domainLoggerInterface.js';

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
   * Logger instance
   */
  private readonly logger: DomainLogger;

  /**
   * Note Settings service constructor
   * @param noteSettingsRepository - note settings repository
   * @param teamRepository - team repository
   * @param shared - shared domain methods
   * @param logger - domain logger
   */
  constructor(noteSettingsRepository: NoteSettingsRepository, teamRepository: TeamRepository, private readonly shared: SharedDomainMethods, logger: DomainLogger) {
    this.noteSettingsRepository = noteSettingsRepository;
    this.teamRepository = teamRepository;
    this.logger = logger;
  }

  /**
   * Add user to the team by invitation hash
   * @param invitationHash - hash for joining to the team
   * @param userId - user to add
   */
  public async addUserToTeamByInvitationHash(invitationHash: InvitationHash, userId: User['id']): Promise<TeamMemberPublic | null> {
    const defaultUserRole = MemberRole.Read;
    const noteSettings = await this.noteSettingsRepository.getNoteSettingsByInvitationHash(invitationHash);

    /**
     * Check if invitation hash is valid
     */
    if (noteSettings === null) {
      throw new DomainError(`Wrong invitation`);
    }

    /**
     * Try to get team member by user and note id
     */
    const member = await this.teamRepository.getTeamMemberByNoteAndUserId(userId, noteSettings.noteId);

    if (member !== null) {
      return {
        noteId: await this.shared.note.getNotePublicIdByInternal(member.noteId),
        userId: member.userId,
        role: member.role,
      };
    }

    const teamMember = await this.teamRepository.createTeamMembership({
      noteId: noteSettings.noteId,
      userId,
      role: defaultUserRole,
    });

    this.logger.info('Team member joined', {
      userId,
      noteId: teamMember.noteId,
      role: teamMember.role,
    });

    return {
      noteId: await this.shared.note.getNotePublicIdByInternal(teamMember.noteId),
      userId: teamMember.userId,
      role: teamMember.role,
    };
  }

  /**
   * Returns settings for a note with all team members
   * @param id - note internal id
   */
  public async getNoteSettingsByNoteId(id: NoteInternalId): Promise<NoteSettings> {
    const noteSettings = await this.noteSettingsRepository.getNoteSettingsByNoteId(id);

    if (noteSettings === null) {
      throw new DomainError(`Note settings not found`);
    }

    noteSettings.team = await this.teamRepository.getTeamMembersByNoteId(id);

    return noteSettings;
  }

  /**
   * Adds note settings
   * @param noteId - note id
   * @param isPublic - is note public
   * @returns added note settings
   */
  public async addNoteSettings(noteId: NoteInternalId, isPublic: boolean = true): Promise<NoteSettings> {
    const noteSettings = await this.noteSettingsRepository.addNoteSettings({
      noteId: noteId,
      isPublic: isPublic,
      invitationHash: createInvitationHash(),
      showNoteHierarchy: false,
    });

    this.logger.debug('Note settings created', {
      noteId,
      isPublic,
    });

    return noteSettings;
  }

  /**
   * Partially updates note settings
   * @param noteId - note internal id
   * @param data - note settings data with new values
   * @returns updated note settings
   */
  public async patchNoteSettingsByNoteId(noteId: NoteInternalId, data: Partial<NoteSettings>): Promise<NoteSettings | null> {
    const noteSettings = await this.noteSettingsRepository.getNoteSettingsByNoteId(noteId);

    if (noteSettings === null) {
      throw new DomainError(`Note settings not found`);
    }

    /**
     * In this case we need to remove previous cover
     */
    if (notEmpty(data.cover) && notEmpty(noteSettings.cover)) {
      try {
        await this.shared.fileUploader.deleteFile(noteSettings.cover);
      } catch (error) {
        this.logger.warn('Previous cover not deleted', { err: error });
      }

      this.logger.debug('Note cover replaced', {
        noteId,
        oldCoverKey: noteSettings.cover,
        newCoverKey: data.cover,
      });
    }

    const updatedSettings = await this.noteSettingsRepository.patchNoteSettingsById(noteSettings.id, data);

    const changedFields = Object.keys(data);

    this.logger.info('Note settings updated', {
      noteId,
      changedFields,
    });

    return updatedSettings;
  }

  /**
   * Get user role in team by user id and note id
   * If user is not a member of note, return null
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<MemberRole | undefined> {
    const team = await this.getInheritedTeamByNoteId(noteId);

    return team.find(teamMember => teamMember.userId === userId)?.role;
  }

  /**
   * Get all team members by note id
   * @param noteId - note id to get all team members
   * @returns team members
   */
  public async getInheritedTeamByNoteId(noteId: NoteInternalId): Promise<Team> {
    let team = await this.teamRepository.getInheritedTeamByNoteId(noteId);
    let parentId = await this.shared.note.getParentNoteIdByNoteId(noteId);

    /**
     * team.length === 1 means that team contains only creator or owner, it means that team is not specified by user
     * parentId === null means that note has no parent to inherit its team
     */
    while (team.length === 1 && parentId !== null) {
      team = await this.teamRepository.getInheritedTeamByNoteId(parentId);
      parentId = await this.shared.note.getParentNoteIdByNoteId(parentId);
    }

    return team;
  }

  /**
   * Remove team member by userId and noteId
   * @param userId - id of team member
   * @param noteId - note internal id
   * @returns returns userId if team member was deleted and undefined otherwise
   */
  public async removeTeamMemberByUserIdAndNoteId(userId: TeamMember['id'], noteId: NoteInternalId): Promise<User['id'] | undefined> {
    const removedUserId = await this.teamRepository.removeTeamMemberByUserIdAndNoteId(userId, noteId);

    if (removedUserId !== undefined) {
      this.logger.info('Team member removed', {
        userId: removedUserId,
        noteId,
      });
    }

    return removedUserId;
  }

  /**
   * Creates team member
   * @param team - data for team member creation
   * @returns created team member
   */
  public async createTeamMember(team: TeamMemberCreationAttributes): Promise<TeamMember> {
    const createdMember = await this.teamRepository.createTeamMembership(team);

    this.logger.info('Team member created', {
      userId: createdMember.userId,
      noteId: createdMember.noteId,
      role: createdMember.role,
    });

    return createdMember;
  }

  /**
   * Updates invitation hash in note settings
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

    this.logger.info('Invitation hash regenerated', {
      noteId,
    });

    return updatedNoteSettings;
  }

  /**
   * Patch team member role by user and note id
   * @param id - userId of team member
   * @param noteId - note internal id
   * @param role - new team member role
   * @returns returns 1 if the role has been changed and 0 otherwise
   */
  public async patchMemberRoleByUserId(id: TeamMember['id'], noteId: NoteInternalId, role: MemberRole): Promise<MemberRole | undefined> {
    const previousRole = await this.teamRepository.patchMemberRoleByUserId(id, noteId, role);

    this.logger.info('Member role changed', {
      userId: id,
      noteId,
      newRole: role,
    });

    return previousRole;
  }
}
