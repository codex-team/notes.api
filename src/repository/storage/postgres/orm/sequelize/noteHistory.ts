import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize, ModelStatic } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from './note.js';
import { UserModel } from './user.js';
import type { NoteHistoryCreationAttributes, NoteHistoryRecord, NoteHistoryMeta } from '@domain/entities/noteHistory.js';

export class NoteHistoryModel extends Model<InferAttributes<NoteHistoryModel>, InferCreationAttributes<NoteHistoryModel>> {
  public declare id: CreationOptional<NoteHistoryRecord['id']>;
  public declare noteId: NoteHistoryRecord['noteId'];
  public declare userId: NoteHistoryRecord['userId'];
  public declare updatedAt: CreationOptional<NoteHistoryRecord['updatedAt']>;
  public declare content: NoteHistoryRecord['content'];
}

export default class NoteHistorySequelizeStorage {
  public model: typeof NoteHistoryModel;

  public userModel: typeof UserModel | null = null;

  public noteModel: typeof NoteModel | null = null;

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
      updatedAt: DataTypes.DATE,
      content: DataTypes.JSON,
    }, {
      tableName: this.tableName,
      sequelize: this.database,
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
      as: this.userModel.tableName,
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
      as: this.noteModel.tableName,
    });
  }

  public async createNoteHistoryRecord(options: NoteHistoryCreationAttributes): Promise<NoteHistoryRecord> {
    return await this.model.create({
      noteId: options.noteId,
      userId: options.userId,
      content: options.content,
    });
  }

  public async getNoteHistoryByNoteId(noteId: NoteHistoryRecord['noteId']): Promise<NoteHistoryMeta[]> {
    return await this.model.findAll({
      where: { noteId },
      attributes: ['id', 'noteId', 'userId', 'updatedAt'],
    });
  }

  public async getHistoryRecordById(id: NoteHistoryRecord['id']): Promise<NoteHistoryRecord | null> {
    return await this.model.findByPk(id);
  }
}
