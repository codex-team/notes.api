import type NoteView from '@domain/entities/noteView.js';
import type User from '@domain/entities/user.js';
import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from './note.js';
import { UserModel } from './user.js';
import type { NoteInternalId } from '@domain/entities/note.js';


/**
 *
 */
export class NoteViewsModel extends Model<InferAttributes<NoteViewsModel>, InferCreationAttributes<NoteViewsModel>> {
  public declare id: CreationOptional<NoteView['id']>;

  public declare noteId: NoteView['noteId'];

  public declare userId: NoteView['userId'];

  public declare visitedAt: NoteView['visitedAt'];
}

/**
 *
 */
export default class NoteViewsSequelizeStorage {
  public model: typeof NoteViewsModel;

  public userModel: typeof UserModel | null = null;

  public noteModel: typeof NoteModel | null = null;

  private readonly database: Sequelize;

  private readonly tableName = 'note_views';

  /**
   *
   * @param ormInstance - ORM instanse
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    this.model = NoteViewsModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel.tableName,
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel.tableName,
          key: 'id',
        },
      },
      visitedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
    });
  };

  /**
   * Creates association with user model
   *
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
   *
   * @param model - initialized note model
   */
  public createAssociationWithNoteModel(model: ModelStatic<NoteModel>): void {
    this.noteModel = model;

    this.model.belongsTo(this.noteModel, {
      foreignKey: 'noteId',
      as: this.noteModel.tableName,
    });
  }

  /**
   * Updates existing noteView's vizitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   * @returns created or updated NoteView
   */
  public async saveVisit(noteId: NoteInternalId, userId: User['id']): Promise<NoteView> {
    /**
     * If user has already visited note, than existing record will be updated
     * If user is visiting note for the first time, new record will be created
     */
    /* eslint-disable-next-line */
    const [recentVisit, _] = await this.model.upsert({
      noteId,
      userId,
      visitedAt: 'CURRENT TIME',
    }, {
      conflictWhere: {
        noteId,
        userId,
      },
      returning: true,
    });

    return recentVisit;
  }
}