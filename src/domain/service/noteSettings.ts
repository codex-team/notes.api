import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type NoteSettingsRepository from '@repository/noteSettings.repository.js';
import type TeamRepository from '@repository/team.repository.js';
import type { Team, TeamCreationAttributes } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';

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
   * @param noteSettingsrepository - note settings repository
   * @param teamRepository - team repository
   */
  constructor(noteSettingsrepository: NoteSettingsRepository, teamRepository: TeamRepository) {
    this.noteSettingsRepository = noteSettingsrepository;
    this.teamRepository = teamRepository;
  }

  /**
   * Returns settings for a note with passed id
   *
   * @param id - note internal id
   */
  public async getNoteSettingsByNoteId(id: NoteInternalId): Promise<NoteSettings> {
    return await this.noteSettingsRepository.getNoteSettingsByNoteId(id);
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

    return await this.noteSettingsRepository.patchNoteSettingsById(noteSettings.id, data);
  }

  /**
   * Get user role in team by user id and note id
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<string | null> {
    return await this.teamRepository.getUserRoleByUserIdAndNoteId(userId, noteId);
  }

  /**
   * Get all team relations by note id
   *
   * @param noteId - note id to get all team relations
   * @returns team relations
   */
  public async getTeamByNoteId(noteId: NoteInternalId): Promise<Team[]> {
    return await this.teamRepository.getByNoteId(noteId);
  }

  /**
   * Remove team relation by id
   *
   * @param id - team relation id
   */
  public async removeTeamRelationById(id: Team['id']): Promise<boolean> {
    return await this.teamRepository.removeRelationById(id);
  }

  /**
   * Creates team relation
   *
   * @param team - data for team creation
   * @returns created team
   */
  public async createTeamRelation(team: TeamCreationAttributes): Promise<Team> {
    return await this.teamRepository.create(team);
  }
}
