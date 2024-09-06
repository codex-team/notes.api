import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type { Team, TeamMemberCreationAttributes, TeamMember } from '@domain/entities/team.js';
import { UserModel } from './user.js';
import { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';
import type { NoteInternalId, NoteParentsStructure } from '@domain/entities/note.js';
import type { NoteRelationsModel } from './noteRelations.js';
import { isEmpty } from '@infrastructure/utils/empty.js';

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

  /**
   * Note relation content
   */
  public declare notes?: NoteModel | null;
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
   * Note relation model instance
   */
  private noteRelationModel: typeof NoteRelationsModel | null = null;

  /**
   * Teams table name
   */
  private readonly tableName = 'note_teams';

  /**
   * Constructor for note storage
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
   * create association with note relations model
   * @param model - initialized note relations model
   */
  public createAssociationWithNoteRelationsModel(model: ModelStatic<NoteRelationsModel>): void {
    this.noteRelationModel = model;
  }

  /**
   * Create new team member membership
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
   * Get team member by user id and note id
   * @param userId - user id to check
   * @param noteId - note id to identify team
   * @returns return null if user is not in team, teamMember otherwhise
   */
  public async getTeamMemberByNoteAndUserId(userId: User['id'], noteId: NoteInternalId): Promise<TeamMember | null> {
    return await this.model.findOne({
      where: {
        noteId,
        userId,
      },
    });
  }

  /**
   * Get all team members by note id
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
   * @param noteId - note id to get all team members
   * @returns team with additional info
   */
  public async getTeamMembersWithUserInfoByNoteId(noteId: NoteInternalId): Promise<Team> {
    if (!this.userModel) {
      throw new Error('TeamStorage: User model not defined');
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
   * Get note parent structure
   * @param noteId - the ID of the note.
   * @param userId - the ID of the user.
   */
  public async getAllNoteParents(noteId: NoteInternalId, userId: number): Promise<NoteParentsStructure> {
    if (!this.noteModel || !this.noteRelationModel) {
      throw new Error(`${this.noteModel !== null ? 'TeamStorage: Note relation model is not defined' : 'TeamStorage: Note model is not defined'}`);
    }

    const parentNotes: NoteParentsStructure = [];
    let currentNoteId: NoteInternalId | null = noteId;
    /**
     * Store notes that user can not access, to check the inherited team if has access
     */
    let storeUnaccessibleNote: NoteParentsStructure = [];

    while (currentNoteId != null) {
      const teamMember = await this.model.findOne({
        where: {
          noteId: currentNoteId,
          userId,
        },
        include: {
          model: this.noteModel,
          as: this.noteModel.tableName,
          required: true,
          attributes: ['publicId', 'content'],
        },
      });

      if (teamMember && !isEmpty(teamMember.notes)) {
        if (storeUnaccessibleNote.length > 0) {
          parentNotes.push(...storeUnaccessibleNote);
          storeUnaccessibleNote = [];
        }
        parentNotes.push({
          noteId: teamMember.notes.publicId,
          content: teamMember.notes.content,
        });
      } else if (teamMember === null) {
        const note = await this.noteModel.findOne({
          where: { id: currentNoteId },
          attributes: ['publicId', 'content'],
        });

        if (note !== null) {
          storeUnaccessibleNote.push({
            noteId: note.publicId,
            content: note.content,
          });
        }
      }

      // Retrieve the parent note
      const noteRelation: NoteRelationsModel | null = await this.noteRelationModel.findOne({
        where: { noteId: currentNoteId },
      });

      if (noteRelation != null) {
        currentNoteId = noteRelation.parentId;
      } else {
        currentNoteId = null;
      }
    }

    return parentNotes.reverse();
  }

  /**
   * Remove team member by id
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
