import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { fn, col } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type User from '@domain/entities/user.js';
import type { UserEditorTool } from '@domain/entities/userExtensions.js';
import { UserList } from '@domain/entities/userList';

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
   * Editor tool data
   */
  tool: UserEditorTool;
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
   * Editor tool
   */
  editorTool: UserEditorTool;
}

/* eslint-disable @typescript-eslint/naming-convention */

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
  public declare created_at: Date;

  /**
   * User photo
   */
  public declare photo: CreationOptional<string>;

  /**
   *
   */
  public declare extensions: CreationOptional<User['extensions']>;
}

/**
 * Class representing a table storing users
 */
export default class UserSequelizeStorage {
  /**
   * User model in database
   */
  public model: typeof UserModel;

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
   *
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      photo: {
        type: DataTypes.STRING,
      },
      extensions: {
        type: DataTypes.JSON,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Link tool with user to use it in the editor
   *
   * @param options - userId & editor credentials to link it to user
   */
  public async addUserEditorTool({
    userId,
    tool: editorTool,
  }: AddUserToolOptions): Promise<void> {
    await this.model.update({
      extensions: fn('array_append', col('editorTools'), editorTool),
    }, {
      where: {
        id: userId,
        // TODO: Add check to unique editorTool id
      },
    });
  }

  /**
   * Remove tool from the list of tools of the current user
   *
   * @param options - identifiers to remove a link between a user and a tool
   */
  public async removeUserEditorTool({
    userId,
    editorTool,
  }: RemoveUserEditorTool): Promise<void> {
    await this.model.update({
      extensions: fn('array_remove', col('editorTools'), editorTool),
    }, {
      where: {
        id: userId,
      },
    });
  }

  /**
   * Insert user
   *
   * @param options - options to insert user
   * @returns { Promise<User> } inserted user
   */
  public async insertUser({
    email,
    name,
    photo,
  }: InsertUserOptions): Promise<User> {
    const user = await this.model.create({
      email,
      name,
      created_at: new Date(),
      photo,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      photo: user.photo,
    };
  }
  /**
   * Get user by id or email
   *
   * @param options - query options
   * @returns { Promise<User | null> } found user
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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
      photo: user.photo,
      extensions: user.extensions,
    };
  }

  /**
   * Get list users
   * @returns { Promise<UserList> } - found all users  
   */
  public async getAllUsers(): Promise<User[]> {
    const userList  = await this.model.findAll({  });

    return userList;
  }
}
