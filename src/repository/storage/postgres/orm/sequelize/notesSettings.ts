import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type { NotesSettingsCreationAttributes } from '@domain/entities/notesSettings.js';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Class representing a notes settings model in database
 */
export class NotesSettingsModel extends Model<InferAttributes<NotesSettingsModel>, InferCreationAttributes<NotesSettingsModel>> {
  /**
   * Note Settings id
   */
  public declare id: CreationOptional<number>;

  /**
   * Note ID
   */
  public declare note_id: number;

  /**
   * Custom hostname
   */
  public declare custom_hostname: CreationOptional<string>;

  /**
   * Is note public
   */
  public declare enabled: CreationOptional<boolean>;
}

/**
 * Class representing a table storing Note Settings
 */
export default class NoteSettingsSequelizeStorage {
  /**
   * Notes settings model in database
   */
  public model: typeof NotesSettingsModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Settings table name
   */
  private readonly tableName = 'notes_settings';

  /**
   * Constructor for note storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate note settings model
     */
    this.model = NotesSettingsModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      note_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel,
          key: 'id',
        },
      },
      custom_hostname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Gets note settings by id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } found note
   */
  public async getNoteSettingsById(id: NotesSettings['id']): Promise<NotesSettings | null> {
    const noteSettings = await this.model.findOne({
      where: {
        id,
      },
    });

    /**
     * If note settings not found, return null
     */
    if (!noteSettings) {
      return null;
    }

    return {
      id: noteSettings.id,
      noteId: noteSettings.note_id,
      enabled: noteSettings.enabled,
      customHostname: noteSettings.custom_hostname,
    };
  }

  /**
   * Get note settings
   *
   * @param noteId - note id
   * @returns { Promise<NotesSettings | null> } - note settings
   */
  public async getNoteSettingsByNoteId(noteId: NotesSettings['noteId']): Promise<NotesSettings> {
    const settings = await this.model.findOne({
      where: {
        note_id: noteId,
      },
    });

    if (!settings) {
      /**
       * TODO: improve exceptions
       */
      throw new Error('Note settings not found');
    }

    return {
      id: settings.id,
      noteId: settings.note_id,
      customHostname: settings.custom_hostname,
      enabled: settings.enabled,
    };
  }

  /**
   * Get note settings
   *
   * @param id - note internal id
   * @returns { Promise<NotesSettings | null> } - note settings
   *
   * @deprecated
   * @todo resolve note setting by internal id
   */
  public async getNoteSettingsByPublicId(id: NotePublicId): Promise<NotesSettings> {
    const settings = await this.model.findOne({
      where: {
        id: id,
      },
    });

    if (!settings) {
      /**
       * TODO: improve exceptions
       */
      throw new Error('Note settings not found');
    }

    return {
      id: settings.id,
      noteId: settings.note_id,
      customHostname: settings.custom_hostname,
      enabled: settings.enabled,
    };
  }

  /**
   * Insert note settings
   *
   * @param options - note settings options
   * @returns { Promise<NotesSettings> } - inserted note settings
   */
  public async insertNoteSettings({
    noteId,
    customHostname,
    enabled,
  }: NotesSettingsCreationAttributes
  ): Promise<NotesSettings> {
    const settings = await this.model.create({
      note_id: noteId,
      custom_hostname: customHostname,
      enabled: enabled,
    });

    return {
      id: settings.id,
      noteId: settings.note_id,
      customHostname: settings.custom_hostname,
      enabled: settings.enabled,
    };
  }

  /**
   * Update note settings
   *
   * @param data - note settings new data
   * @param id - note settings id
   */
  public async patchNoteSettings(data: Partial<NotesSettings>, id: NotesSettings['id']): Promise<NotesSettings | null> {
    const settingsToUpdate = await this.model.findByPk(id);

    /**
     * Check if note settings exists in database
     */
    if (!settingsToUpdate) {
      return null;
    }

    const values = {
      enabled: data.enabled,
      custom_hostname: data.customHostname,
    };

    const updatedSettings = await settingsToUpdate.update(values);

    return {
      id: updatedSettings.id,
      noteId: updatedSettings.note_id,
      customHostname: updatedSettings.custom_hostname,
      enabled: updatedSettings.enabled,
    };
  }
}