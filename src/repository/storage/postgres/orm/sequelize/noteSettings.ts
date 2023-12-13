import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type { NoteSettingsCreationAttributes } from '@domain/entities/noteSettings.js';

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
  public declare noteId: NoteSettings['noteId'];

  /**
   * Custom hostname
   */
  public declare customHostname: CreationOptional<NoteSettings['customHostname']>;

  /**
   * Is note public
   */
  public declare isPublic: CreationOptional<NoteSettings['isPublic']>;

  /**
   * Invitation hash
   */
  public declare invitationHash: NoteSettings['invitationHash'];
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
      noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel.tableName,
          key: 'id',
        },
      },
      customHostname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      invitationHash: {
        type: DataTypes.STRING,
        allowNull: false,
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

    return noteSettings;
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
        noteId: noteId,
      },
    });

    if (!settings) {
      /**
       * TODO: improve exceptions
       */
      throw new Error('Note settings not found');
    }

    return settings;
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
      foreignKey: 'noteId',
      as: this.noteModel.tableName,
    });
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
    isPublic,
    invitationHash,
  }: NoteSettingsCreationAttributes
  ): Promise<NoteSettings> {
    const settings = await this.model.create({
      noteId,
      customHostname,
      isPublic,
      invitationHash,
    });

    return settings;
  }

  /**
   * Update note settings
   *
   * @param id - note settings id
   * @param data - note settings new data
   */
  public async patchNoteSettingsById(id: NoteSettings['id'], data: Partial<NoteSettings>): Promise<NoteSettings | null> {
    const settingsToUpdate = await this.model.findByPk(id);

    /**
     * Check if note settings exists in database
     */
    if (!settingsToUpdate) {
      return null;
    }

    return await settingsToUpdate.update(data);
  }
}
