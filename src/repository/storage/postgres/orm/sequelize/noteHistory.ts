import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize, ModelStatic } from 'sequelize';
import { DataTypes, literal, Model } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from './note.js';
import { UserModel } from './user.js';
import type { NoteHistoryCreationAttributes, NoteHistoryRecord, NoteHistoryMeta, NoteHistoryView } from '@domain/entities/noteHistory.js';

/**
 * Note history model instance
 * Represents structure that is stored in the database
 */
export class NoteHistoryModel extends Model<InferAttributes<NoteHistoryModel>, InferCreationAttributes<NoteHistoryModel>> {
  /**
   * Unique identified of note history record
   */
  public declare id: CreationOptional<NoteHistoryRecord['id']>;

  /**
   * Id of the note whose content history is stored
   */
  public declare noteId: NoteHistoryRecord['noteId'];

  /**
   * User that updated note content
   */
  public declare userId: NoteHistoryRecord['userId'];

  /**
   * Timestamp of the note update
   */
  public declare createdAt: CreationOptional<NoteHistoryRecord['createdAt']>;

  /**
   * Certain version of note content
   */
  public declare content: NoteHistoryRecord['content'];

  /**
   * Note tools of current version of note content
   */
  public declare tools: NoteHistoryRecord['tools'];
}

export default class NoteHistorySequelizeStorage {
  public model: typeof NoteHistoryModel;

  public userModel: typeof UserModel | undefined = undefined;

  public noteModel: typeof NoteModel | undefined = undefined;

  private readonly database: Sequelize;

  private readonly tableName = 'note_history';

  constructor({ connection }: Orm) {
    this.database = connection;

    this.model = NoteHistoryModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel,
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel,
          key: 'id',
        },
      },
      createdAt: DataTypes.DATE,
      content: DataTypes.JSON,
      tools: DataTypes.JSONB,
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Creates association with user model
   * @param model - initialized note settings model
   */
  public createAssociationWithUserModel(model: ModelStatic<UserModel>): void {
    this.userModel = model;

    this.model.belongsTo(this.userModel, {
      foreignKey: 'userId',
      as: 'user',
    });
  }

  /**
   * Creates association with note model
   * @param model - initialized note model
   */
  public createAssociationWithNoteModel(model: ModelStatic<NoteModel>): void {
    this.noteModel = model;

    this.model.belongsTo(this.noteModel, {
      foreignKey: 'noteId',
      as: 'note',
    });
  }

  /**
   * Creates note hisotry record in storage
   * @param options - all data used for note history record creation
   * @returns - created note history record
   */
  public async createNoteHistoryRecord(options: NoteHistoryCreationAttributes): Promise<NoteHistoryRecord> {
    return await this.model.create({
      noteId: options.noteId,
      userId: options.userId,
      content: options.content,
      tools: options.tools,
      /**
       * we should pass to model datatype respectfully to declared in NoteVisitsModel class
       * if we will pass just 'CLOCK_TIMESTAMP()' it will be treated by orm just like a string, that is why we should use literal
       * but model wants string, this is why we use this cast
       */
      createdAt: literal('CLOCK_TIMESTAMP()') as unknown as string,
    });
  }

  /**
   * Gets array of metadata of all saved note history records
   * @param noteId - id of the note, whose history we want to see
   * @returns array of metadata of the history records
   */
  public async getNoteHistoryByNoteId(noteId: NoteHistoryRecord['noteId']): Promise<NoteHistoryMeta[]> {
    const historyMeta = await this.model.findAll({
      where: { noteId },
      attributes: ['id', 'userId', 'createdAt'],
      include: {
        model: this.userModel,
        as: 'user',
        attributes: ['name', 'photo'],
      },
      order: [['createdAt', 'DESC']],
    });

    /**
     * We need this cast because of using sequelize model.include
     * Since it returns NoteHistoryModel[], however we included userModel,
     * without this cast NoteHistoryModel[] and NoteHistoryMeta[] are incompatible
     */
    return historyMeta as unknown as NoteHistoryMeta[];
  }

  /**
   * Get concrete history record by it's id
   * @param id - id of the history record
   * @returns full history record with user information or null if there is no record with such an id
   */
  public async getHistoryRecordById(id: NoteHistoryRecord['id']): Promise<NoteHistoryView | null> {
    const historyView = await this.model.findOne({
      where: {
        id,
      },
      include: {
        model: this.userModel,
        as: 'user',
        attributes: ['name', 'photo'],
      },
    });

    /**
     * We need this cast because of using sequelize model.include
     * Since it returns NoteHistoryModel[], however we included userModel,
     * without this cast NoteHistoryModel[] and NoteHistoryView are incompatible
     */
    return historyView as unknown as NoteHistoryView;
  }

  /**
   * Gets recent saved history record content
   * @param noteId - id of the note, whose recent history record we want to see
   * @returns - latest saved content of the note
   */
  public async getLastContentVersion(noteId: NoteHistoryRecord['id']): Promise<NoteHistoryRecord['content'] | undefined> {
    const latestHistory = await this.model.findOne({
      where: { noteId },
      order: [['createdAt', 'DESC']],
    });

    return latestHistory?.content;
  }

  /**
   * Delete all note history records of the note
   * @param noteId - internal id of the note
   * @returns - true if history was deleted, false otherwise
   */
  public async deleteNoteHistoryByNoteid(noteId: NoteHistoryRecord['id']): Promise<boolean> {
    const destroyedRows = await this.model.destroy({
      where: {
        noteId,
      },
    });

    return destroyedRows !== 0;
  }
}
