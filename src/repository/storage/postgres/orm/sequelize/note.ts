import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type { ModelStatic } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { Note, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type { NoteCreationAttributes } from '@domain/entities/note.js';
import type { NoteSettingsModel } from '@repository/storage/postgres/orm/sequelize/noteSettings.js';
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
  public settingsModel: typeof NoteSettingsModel | null = null;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'notes';

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
  }

  /**
   * Creates association with note settings model
   *
   * @param model - initialized note settings model
   */
  public createAssociationWithNoteSettingsModel(model: ModelStatic<NoteSettingsModel>): void {
    this.settingsModel = model;

    /**
     * Create association with note settings, one-to-one
     */
    this.model.hasOne(this.settingsModel, {
      foreignKey: 'note_id',
      as: this.settingsModel.tableName,
    });
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
   * Gets note by id
   *
   * @param hostname - custom hostname
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    if (!this.settingsModel) {
      return null;
    }
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
}
