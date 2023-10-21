import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { Note, NoteInternalId, NotePublicId, NoteCreatorId } from '@domain/entities/note.js';
import type { NoteList } from '@domain/entities/noteList.js';
import type { NoteCreationAttributes } from '@domain/entities/note.js';
import { NotesSettingsModel } from '@repository/storage/postgres/orm/sequelize/notesSettings.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type { NotesSettingsCreationAttributes } from '@domain/entities/notesSettings.js';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Class representing a note model in database
 */
export class NoteModel extends Model<InferAttributes<NoteModel>, InferCreationAttributes<NoteModel>> {
  /**
   * Id used for internal relations
   */
  public declare id: CreationOptional<Note['id']>;

  /**
   * Id visible for users. Used to query Note by public API
   */
  public declare publicId: Note['publicId'];

  /**
   * Note content
   */
  public declare content: Note['content'];

  /**
   * Note creator, user identifier, who created this note
   */
  public declare creatorId: Note['creatorId'];

  /**
   * Time when note was created
   */
  public declare createdAt: CreationOptional<Note['createdAt']>;

  /**
   * Last time when note was updated
   */
  public declare updatedAt: CreationOptional<Note['updatedAt']>;
}


/**
 * Class representing a table storing Notes
 */
export default class NoteSequelizeStorage {
  /**
   * Note model in database
   */
  public model: typeof NoteModel;

  /**
   * Notes settings model in database
   */
  public settingsModel: typeof NotesSettingsModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'notes';

  /**
   * Settings table name
   */
  private readonly settingsTableName = 'notes_settings';

  /**
   * Constructor for note storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate note model
     */
    this.model = NoteModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      publicId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: DataTypes.JSON,
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel,
          key: 'id',
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      underscored: true, // use snake_case for fields in db
    });

    /**
     * Initiate note settings model
     */
    this.settingsModel = NotesSettingsModel.init({
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
      tableName: this.settingsTableName,
      sequelize: this.database,
      timestamps: false,
    });

    /** NoteModel and NotesSettingsModel are connected as ONE-TO-ONE */
    this.model.hasOne(this.settingsModel, { foreignKey: 'note_id',
      as: this.settingsModel.tableName });
  }

  /**
   * Insert note to database
   *
   * @param options - note creation options
   * @returns { Note } - created note
   */
  public async createNote(options: NoteCreationAttributes): Promise<Note> {
    const createdNote = await this.model.create({
      publicId: options.publicId,
      content: options.content,
      creatorId: options.creatorId,
    });

    return createdNote;
  }

  /**
   * Update note content by public id
   *
   * @param publicId - note public id
   * @param content - new content
   * @returns Note on success, null on failure
   */
  public async updateNoteContentByPublicId(publicId: NotePublicId, content: Note['content']): Promise<Note | null> {
    const [affectedRowsCount, affectedRows] = await this.model.update({
      content,
    }, {
      where: {
        publicId,
      },
      returning: true,
    });

    if (affectedRowsCount !== 1) {
      return null;
    }

    return affectedRows[0];
  }

  /**
   * Gets note by id
   *
   * @param id - internal id
   */
  public async getNoteById(id: NoteInternalId): Promise<Note | null> {
    const note = await this.model.findOne({
      where: {
        id,
      },
    });

    /**
     * If note not found, return null
     */
    if (!note) {
      return null;
    }

    return note;
  }

  /**
   * Gets note settings by id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } found note
   */
  public async getNoteSettingsById(id: NotesSettings['id']): Promise<NotesSettings | null> {
    const noteSettings = await this.settingsModel.findOne({
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
   * Gets note by id
   *
   * @param hostname - custom hostname
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    /**
     * select note which has hostname in its settings
     */
    const note = await this.model.findOne({
      where: {
        '$notes_settings.custom_hostname$': hostname,
      },
      include: {
        model: this.settingsModel,
        as: this.settingsModel.tableName,
        required: true,
      },
    });

    return note;
  }

  /**
   * Gets note by public id
   *
   * @param publicId - note public id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note | null> {
    const note = await this.model.findOne({
      where: {
        publicId,
      },
    });

    return note;
  };

  /**
   * Gets note list by creator id
   *
   * @param creatorId - note creator id
   * @returns { Promise<NoteList | null> } note
   */
  public async getNoteListByCreatorId(creatorId: NoteCreatorId): Promise<NoteList | null> {
    const noteList = await this.model.findAll({
      where: {
        creatorId,
      },
    });

    if (noteList.length === 0) {
      return null;
    };

    return noteList;
  }

  /**
   * Get note settings
   *
   * @param noteId - note id
   * @returns { Promise<NotesSettings | null> } - note settings
   */
  public async getNoteSettingsByNoteId(noteId: NotesSettings['noteId']): Promise<NotesSettings> {
    const settings = await this.settingsModel.findOne({
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
    const settings = await this.settingsModel.findOne({
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
    const settings = await this.settingsModel.create({
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
    const settingsToUpdate = await this.settingsModel.findByPk(id);

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
