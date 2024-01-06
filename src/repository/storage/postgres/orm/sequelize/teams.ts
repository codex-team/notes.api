import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type { Team, TeamMemberCreationAttributes, TeamMember } from '@domain/entities/team.js';
import { UserModel } from './user.js';
import { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';
import type { NoteInternalId } from '@domain/entities/note.js';

/**
 * Class representing a teams model in database
 */
export class TeamsModel extends Model<InferAttributes<TeamsModel>, InferCreationAttributes<TeamsModel>> {
  /**
   * team member id
   */
  public declare id: CreationOptional<TeamMember['id']>;

  /**
   * Note ID
   */
  public declare noteId: TeamMember['noteId'];

  /**
   * Team member user id
   */
  public declare userId: TeamMember['userId'];

  /**
   * Team member role, show what user can do with note
   */
  public declare role: MemberRole;
}

/**
 * Class representing a table storing note teams
 */
export default class TeamsSequelizeStorage {
  /**
   * Team model in database
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
   * Teams table name
   */
  private readonly tableName = 'note_teams';

  /**
   * Constructor for note storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate note note teams model
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
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: MemberRole.read,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
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
   * Create new team member
   *
   * @param data - team member data
   */
  public async insert(data: TeamMemberCreationAttributes): Promise<TeamMember> {
    return await this.model.create({
      noteId: data.noteId,
      userId: data.userId,
      role: data.role,
    });
  }

  /**
   * Get team by user id and note id
   *
   * @param userId - team member id
   * @param noteId - note id
   * @returns { Promise<TeamMember | null> } found team relation
   */
  public async getTeamByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<TeamMember | null> {
    return await this.model.findOne({
      where: {
        noteId,
        userId,
      },
    });
  }

  /**
   * Get user role by user id and note id
   * If user is not a member of note, return null
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<MemberRole | null> {
    const res = await this.model.findOne({
      where: {
        userId,
        noteId,
      },
    });

    return res?.role ?? null;
  }

  /**
   * Get all team members by note id
   *
   * @param noteId - note id to get all team members
   * @returns team relations
   */
  public async getMembersByNoteId(noteId: NoteInternalId): Promise<Team> {
    return await this.model.findAll({
      where: {
        noteId,
      },
    });
  }

  /**
   * Remove team member by id
   *
   * @param id - team member id
   */
  public async removeTeamMemberById(id: TeamMember['id']): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        id,
      },
    });

    return affectedRows > 0;
  }
}
