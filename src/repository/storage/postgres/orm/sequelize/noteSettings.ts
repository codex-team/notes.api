import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { NotePublicId } from '@domain/entities/note.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type { NoteSettingsCreationAttributes } from '@domain/entities/noteSettings.js';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Class representing a notes settings model in database
 */
export class NoteSettingsModel extends Model<InferAttributes<NoteSettingsModel>, InferCreationAttributes<NoteSettingsModel>> {
  /**
   * Note Settings id
   */
  public declare id: CreationOptional<NoteSettings['id']>;

  /**
   * Note ID
   */
  public declare note_id: NoteSettings['noteId'];

  /**
   * Custom hostname
   */
  public declare custom_hostname: CreationOptional<NoteSettings['customHostname']>;

  /**
   * Is note public
   */
  public declare enabled: CreationOptional<NoteSettings['enabled']>;
}

/**
 * Class representing a table storing Note Settings
 */
export default class NoteSettingsSequelizeStorage {
  /**
   * Notes settings model in database
   */
  public model: typeof NoteSettingsModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Note model instance
   */
  private noteModel: typeof NoteModel | null = null;

  /**
   * Settings table name
   */
  private readonly tableName = 'note_settings';

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
    this.model = NoteSettingsModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      note_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel.tableName,
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
      underscored: true, // use snake_case for fields in db
    });
  }

  /**
   * Gets note settings by id
   *
   * @param id - note id
   * @returns { Promise<NoteSettings | null> } found note
   */
  public async getNoteSettingsById(id: NoteSettings['id']): Promise<NoteSettings | null> {
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
   * @returns { Promise<NoteSettings | null> } - note settings
   */
  public async getNoteSettingsByNoteId(noteId: NoteSettings['noteId']): Promise<NoteSettings> {
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
   * Creates association with note model to make joins
   *
   * @param model - initialized note model
   */
  public createAssociationWithNoteModel(model: ModelStatic<NoteModel>): void {
    this.noteModel = model;

    /**
     * Make one-to-one association with note model
     * We can not create note settings without note
     */
    this.model.belongsTo(model, {
      foreignKey: 'note_id',
      as: this.noteModel.tableName,
    });
  }

  /**
   * Get note settings
   *
   * @param id - note internal id
   * @returns { Promise<NoteSettings | null> } - note settings
   *
   * @deprecated
   * @todo resolve note setting by internal id
   */
  public async getNoteSettingsByPublicId(id: NotePublicId): Promise<NoteSettings | null> {
    /**
     * Check if note model is initialized
     */
    if (!this.noteModel) {
      return null;
    }

    const settings = await this.model.findOne({
      where: {
        '$notes.public_id$': id,
      },
      include: {
        model: this.noteModel,
        as: this.noteModel.tableName,
        required: true,
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
   * @returns { Promise<NoteSettings> } - inserted note settings
   */
  public async insertNoteSettings({
    noteId,
    customHostname,
    enabled,
  }: NoteSettingsCreationAttributes
  ): Promise<NoteSettings> {
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
  public async patchNoteSettingsByPublicId(data: Partial<NoteSettings>, id: NoteSettings['id']): Promise<NoteSettings | null> {
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
