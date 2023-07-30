import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type Note from '@domain/entities/note.js';
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
   * Note id
   */
  public declare id: CreationOptional<Note['id']>;

  /**
   * Note title
   */
  public declare title: Note['title'];

  /**
   * Note content
   */
  public declare content: Note['content'];

  /**
   * Note creator, user identifier, who created this note
   */
  public declare creator_id: Note['creatorId'];
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
      title: DataTypes.STRING,
      content: DataTypes.JSON,
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel,
          key: 'id',
        },
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
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
      public_id: {
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
      title: options.title,
      content: options.content,
      creator_id: options.creatorId,
    });

    return {
      id: createdNote.id,
      title: createdNote.title,
      content: createdNote.content,
      creatorId: createdNote.creator_id,
    };
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteById(id: Note['id']): Promise<Note | null> {
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

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      creatorId: note.creator_id,
    };
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
      publicId: noteSettings.public_id,
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

    /**
     * If note not found, return null
     */
    if (!note) {
      return null;
    }

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      creatorId: note.creator_id,
    };
  }

  /**
   * Gets note by public id
   *
   * @param publicId - note public id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByPublicId(publicId: NotesSettings['publicId']): Promise<Note | null> {
    const note = await this.model.findOne({
      where: {
        '$notes_settings.public_id$': publicId,
      },
      include: {
        model: this.settingsModel,
        as: this.settingsModel.tableName,
        required: true,
      },
    });

    if (!note) {
      return null;
    }

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      creatorId: note.creator_id,
    };
  };

  /**
   * Get note settings
   *
   * @param publicId - note public id
   * @returns { Promise<NotesSettings | null> } - note settings
   */
  public async getNoteSettingsByPublicId(publicId: NotesSettings['publicId']): Promise<NotesSettings> {
    const settings = await this.settingsModel.findOne({
      where: {
        public_id: publicId,
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
      publicId: settings.public_id,
      enabled: settings.enabled,
    };
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
      publicId: settings.public_id,
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
    publicId,
    enabled,
  }: NotesSettingsCreationAttributes
  ): Promise<NotesSettings> {
    const settings = await this.settingsModel.create({
      note_id: noteId,
      custom_hostname: customHostname,
      public_id: publicId,
      enabled: enabled,
    });

    return {
      id: settings.id,
      noteId: settings.note_id,
      customHostname: settings.custom_hostname,
      publicId: settings.public_id,
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
      publicId: updatedSettings.public_id,
      enabled: updatedSettings.enabled,
    };
  }
}
