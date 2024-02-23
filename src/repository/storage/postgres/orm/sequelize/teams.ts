import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type { Team, TeamMemberCreationAttributes, TeamMember } from '@domain/entities/team.js';
import { UserModel } from './user.js';
import { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import { DomainError } from '@domain/entities/DomainError.js';

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
        defaultValue: MemberRole.Read,
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
      as: 'user',
    });
  }

  /**
   * Create new team member membership
   *
   * @param data - team membership data
   */
  public async createTeamMembership(data: TeamMemberCreationAttributes): Promise<TeamMember> {
    return await this.model.create({
      noteId: data.noteId,
      userId: data.userId,
      role: data.role,
    });
  }

  /**
   * Check if user is note team member
   *
   * @param userId - user id to check
   * @param noteId - note id to identify team
   * @returns { Promise<boolean> } returns true if user is team member
   */
  public async isUserInTeam(userId: User['id'], noteId: NoteInternalId): Promise<boolean> {
    const teamMemberShip = await this.model.findOne({
      where: {
        noteId,
        userId,
      },
    });

    return teamMemberShip !== null;
  }

  /**
   * Get user role by user id and note id
   * If user is not a member of note, return null
   *
   * @param userId - user id to check his role
   * @param noteId - note id where user should have role
   */
  public async getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: NoteInternalId): Promise<MemberRole | undefined> {
    const res = await this.model.findOne({
      where: {
        userId,
        noteId,
      },
    });

    return res?.role ?? undefined;
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
   * Get all team members by note id with info about users
   *
   * @param noteId - note id to get all team members
   * @returns team with additional info
   */
  public async getTeamMembersByNoteId(noteId: NoteInternalId): Promise<Team> {
    if (!this.userModel) {
      throw new DomainError('User model not initialized');
    }

    return await this.model.findAll({
      where: { noteId },
      attributes: ['id', 'role'],
      include: {
        model: this.userModel,
        as: 'user',
        required: true,
        attributes: ['id', 'name', 'email', 'photo'],
      },
    });
  }

  /**
   * Remove team member by id
   *
   * @param userId - id of team member
   * @param noteId - note internal id
   * @returns returns userId if team member was deleted and undefined overwise
   */
  public async removeTeamMemberByUserIdAndNoteId(userId: TeamMember['id'], noteId: NoteInternalId): Promise<User['id'] | undefined> {
    const affectedRows = await this.model.destroy({
      where: {
        userId,
        noteId,
      },
    });

    return affectedRows > 0 ? userId : undefined;
  }

  /**
   * Patch team member role by user and note id
   *
   * @param userId - id of team member
   * @param noteId - note internal id
   * @param role - new team member role
   * @returns returns 1 if the role has been changed and 0 otherwise
   */
  public async patchMemberRoleById(userId: TeamMember['id'], noteId: NoteInternalId, role: MemberRole): Promise<MemberRole | undefined> {
    const affectedRows = await this.model.update({
      role: role,
    }, {
      where: {
        userId,
        noteId,
      },
    });

    // if counter of affected rows is more than 0, then we return new role
    return affectedRows[0] ? role : undefined;
  }
}
