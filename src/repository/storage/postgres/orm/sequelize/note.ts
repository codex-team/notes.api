import type { CreationOptional, InferAttributes, InferCreationAttributes, ModelStatic, Sequelize } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { Note, NoteCreationAttributes, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import type { NoteList } from '@domain/entities/noteList.js';
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
      underscored: true,
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
      foreignKey: 'noteId',
      as: 'noteSettings',
    });
  }

  /**
   * Insert note to database
   *
   * @param options - note creation options
   * @returns { Note } - created note
   */
  public async createNote(options: NoteCreationAttributes): Promise<Note> {
    return await this.model.create({
      publicId: options.publicId,
      content: options.content,
      creatorId: options.creatorId,
    });
  }

  /**
   * Update note content by id
   *
   * @param id - note internal id
   * @param content - new content
   * @returns Note on success, null on failure
   */
  public async updateNoteContentById(id: NoteInternalId, content: Note['content']): Promise<Note | null> {
    const [affectedRowsCount, affectedRows] = await this.model.update({
      content,
    }, {
      where: {
        id,
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
    return await this.model.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * Deletes note by id
   *
   * @param id - internal id
   */
  public async deleteNoteById(id: NoteInternalId): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where:{
        id,
      },
    });

    /**
     * If note not found return false
     */
    return affectedRows > 0;
  }

  /**
   * Gets note list by creator id
   *
   * @param creatorId - note creator id
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   * @returns { Promise<NoteList> } note
   */
  public async getNoteListByCreatorId(creatorId: number, offset: number, limit: number): Promise<Note[]> {
    return await this.model.findAll({
      offset: offset,
      limit: limit,
      where: {
        creatorId,
      },
    });
  }
  /**
   * Gets note by id
   *
   * @param hostname - custom hostname
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    if (!this.settingsModel) {
      throw new Error('Note settings model not initialized');
    }

    /**
     * select note which has hostname in its settings
     */
    return await this.model.findOne({
      where: {
        '$noteSettings.custom_hostname$': hostname,
      },
      include: {
        model: this.settingsModel,
        as: 'noteSettings',
        required: true,
      },
    });
  }

  /**
   * Gets note by public id
   *
   * @param publicId - note public id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note | null> {
    return await this.model.findOne({
      where: {
        publicId,
      },
    });
  };
}
