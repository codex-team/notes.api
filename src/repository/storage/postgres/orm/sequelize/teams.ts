import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type { Team, TeamCreationAttributes } from '@domain/entities/team.js';
import { UserModel } from './user.js';
import { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';
import type { NoteInternalId } from '@domain/entities/note.js';

/**
 * Class representing a teams model in database
 */
export class TeamsModel extends Model<InferAttributes<TeamsModel>, InferCreationAttributes<TeamsModel>> {
  /**
   * Collaborator relation id
   */
  public declare id: CreationOptional<Team['id']>;

  /**
   * Note ID
   */
  public declare noteId: Team['noteId'];

  /**
   * Team member user id
   */
  public declare userId: Team['userId'];

  /**
   * Team member role, show what user can do with note
   */
  public declare role: MemberRole;
}

/**
 * Class representing a table storing Note Settings
 */
export default class TeamsSequelizeStorage {
  /**
   * Notes settings model in database
   */
  public model: typeof TeamsModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Note model instance
   */
  private noteModel: typeof NoteModel | null = null;

  /**
   * User model instance
   */
  private userModel: typeof UserModel | null = null;

  /**
   * Settings table name
   */
  private readonly tableName = 'teams';

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
    this.model = TeamsModel.init({
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
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: UserModel.tableName,
          key: 'id',
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: MemberRole.read,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
      underscored: true, // use snake_case for fields in db
    });
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
     * We can not create team relation without note
     */
    this.model.belongsTo(model, {
      foreignKey: 'noteId',
      as: this.noteModel.tableName,
    });
  }

  /**
   * Creates association with user model to make joins
   *
   * @param model - initialized user model
   */
  public createAssociationWithUserModel(model: ModelStatic<UserModel>): void {
    this.userModel = model;

    /**
     * Make one-to-one association with user model
     * We can not create team relation without user
     */
    this.model.belongsTo(model, {
      foreignKey: 'userId',
      as: this.userModel.tableName,
    });
  }

  /**
   * Create new team relation
   *
   * @param data - team relation data
   */
  public async insert(data: TeamCreationAttributes): Promise<Team> {
    return await this.model.create(data);
  }

  /**
   * Get user role by user id and note id
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<string | null> {
    const res = await this.model.findOne({
      where: {
        userId,
        noteId,
      },
    });

    return res?.role ?? null;
  }

  /**
   * Get all team relations by note id
   *
   * @param noteId - note id to get all team relations
   * @returns team relations
   */
  public async getByNoteId(noteId: NoteInternalId): Promise<Team[]> {
    return await this.model.findAll({
      where: {
        noteId,
      },
    });
  }

  /**
   * Remove team relation by id
   *
   * @param id - team relation id
   */
  public async removeRelationById(id: Team['id']): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        id,
      },
    });

    return affectedRows > 0;
  }
}