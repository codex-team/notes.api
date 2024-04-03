import type NoteVisit from '@domain/entities/noteVisit.js';
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
export class NoteVisitsModel extends Model<InferAttributes<NoteVisitsModel>, InferCreationAttributes<NoteVisitsModel>> {
  public declare id: CreationOptional<NoteVisit['id']>;

  public declare noteId: NoteVisit['noteId'];

  public declare userId: NoteVisit['userId'];

  public declare visitedAt: CreationOptional<NoteVisit['visitedAt']>;
}

/**
 *
 */
export default class NoteVisitsSequelizeStorage {
  public model: typeof NoteVisitsModel;

  public userModel: typeof UserModel | null = null;

  public noteModel: typeof NoteModel | null = null;

  private readonly database: Sequelize;

  private readonly tableName = 'note_visits';

  /**
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    this.model = NoteVisitsModel.init({
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
      /**
       * Disable auto-generated created_at and updated_at since we use own visited_at
       */
      timestamps: false,
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
   * Updates existing noteVisit's visitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   * @returns created or updated NoteVisit
   */
  public async saveVisit(noteId: NoteInternalId, userId: User['id']): Promise<NoteVisit> {
    /**
     * If user has already visited note, then existing record will be updated
     * If user is visiting note for the first time, new record will be created
     */
    const [recentVisit, _] = await this.model.upsert({
      noteId,
      userId,
    }, {
      conflictWhere: {
        noteId,
        userId,
      },
      returning: true,
    });

    return recentVisit;
  }

  /**
   * Deletes all visits of the note when a note is deleted
   *
   * @param noteId - note internal id
   */
  public async deleteNoteVisits(noteId: NoteInternalId): Promise<boolean> {
    const deletedNoteVisits = await this.model.destroy({
      where: {
        noteId,
      },
    });

    if (deletedNoteVisits) {
      return true;
    }

    return false;
  }
}