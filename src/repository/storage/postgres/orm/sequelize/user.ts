import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { literal } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type User from '@domain/entities/user.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type { NoteHistoryModel } from './noteHistory.js';

/**
 * Query options for getting user
 */
interface GetUserQueryOptions {
  /**
   * User id
   */
  id?: number;

  /**
   * User email
   */
  email?: string;
}

interface InsertUserOptions {
  /**
   * User email
   */
  email: string;

  /**
   * User name
   */
  name: string;

  /**
   * User photo
   */
  photo?: string;

  /**
   * User editor tools
   */
  editorTools: EditorTool['id'][];
}

/**
 * Options for linking a tool to a user
 */
export interface AddUserToolOptions {
  /**
   * User identifier
   */
  userId: User['id'];

  /**
   * Editor tool identifier
   */
  toolId: EditorTool['id'];
}

/**
 * Remove link to a tool from a user
 */
interface RemoveUserEditorTool {
  /**
   * User identifier
   */
  userId: User['id'];

  /**
   * Editor tool identifier
   */
  toolId: EditorTool['id'];
}

/**
 * Class representing a user model in database
 */
export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  /**
   * User id
   */
  public declare id: CreationOptional<number>;

  /**
   * User email address
   */
  public declare email: string;

  /**
   * User name
   */
  public declare name: string;

  /**
   * User created at
   */
  public declare createdAt: Date;

  /**
   * User photo
   */
  public declare photo: CreationOptional<string>;

  /**
   * List of tools ids installed by user from Marketplace
   */
  public declare editorTools: CreationOptional<User['editorTools']>;
}

/**
 * Class representing a table storing users
 */
export default class UserSequelizeStorage {
  /**
   * User model in database
   */
  public model: typeof UserModel;

  public historyModel: typeof NoteHistoryModel | null = null;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'users';

  /**
   * Constructor for user storage
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate user model
     */
    this.model = UserModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      photo: {
        type: DataTypes.STRING,
      },
      editorTools: {
        type: DataTypes.JSONB,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Link tool with user to use it in the editor
   * @param options - userId & editor credentials to link it to user
   */
  public async addUserEditorTool({
    userId,
    toolId,
  }: AddUserToolOptions): Promise<void> {
    await this.model.update({
      editorTools: literal(
        /**
         * If editorTools is null, then set it to empty array
         * Then add the tool to the list
         */
        `COALESCE(editor_tools, '[]'::jsonb) || '["${toolId}"]'::jsonb`),
    }, {
      where: {
        id: userId,
        // @todo Add check to unique editorTool id
      },
    });
  }

  /**
   * Remove tool from the list of tools of the current user
   * @param options - identifiers to remove a link between a user and a tool
   */
  public async removeUserEditorTool({
    userId,
    toolId,
  }: RemoveUserEditorTool): Promise<void> {
    await this.model.update({
      editorTools: literal(`editor_tools - '${toolId}'`),
    }, {
      where: {
        id: userId,
      },
    });
  }

  /**
   * Insert user
   * @param options - options to insert user
   * @returns inserted user
   */
  public async insertUser({
    email,
    name,
    photo,
    editorTools,
  }: InsertUserOptions): Promise<User> {
    return await this.model.create({
      email,
      name,
      createdAt: new Date(),
      photo,
      editorTools,
    });
  }

  /**
   * Get user by id or email
   * @param options - query options
   * @returns found user
   */
  public async getUserByIdOrEmail({
    id,
    email,
  }: GetUserQueryOptions): Promise<User | null> {
    let user: UserModel | null;

    /**
     * Check if id or email is provided
     */
    if (id !== undefined) {
      /**
       * Find user by id
       */
      user = await this.model.findOne({
        where: {
          id,
        },
      });
    } else if (email !== undefined) {
      /**
       * Find user by email
       */
      user = await this.model.findOne({
        where: {
          email,
        },
      });
    } else {
      /**
       * No id or email provided
       */
      return null;
    }

    if (!user) {
      return null;
    }

    return user;
  }
}
