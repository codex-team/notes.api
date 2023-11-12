import { fn, col } from 'sequelize';
import type User from '@domain/entities/user.js';
import type EditorTool from '@domain/entities/editorTools';
import type UserModelSequelize from '@repository/storage/postgres/orm/sequelize/userModel.js';
import type { UserModel } from '@repository/storage/postgres/orm/sequelize/userModel.js';

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
 * Class representing a table storing users
 */
export default class UserSequelizeStorage {
  /**
   * User model in database
   */
  public model: typeof UserModel;

  /**
   *  Constructor for user model storage
   *
   * @param model - user model instance
   */
  constructor({ model }: UserModelSequelize) {
    this.model = model;
  }

  /**
   * Link tool with user to use it in the editor
   *
   * @param options - userId & editor credentials to link it to user
   */
  public async addUserEditorTool({
    userId,
    toolId,
  }: AddUserToolOptions): Promise<void> {
    await this.model.update({
      editorTools: fn('array_append', col('editor_tools'), toolId),
    }, {
      where: {
        id: userId,
        // @todo Add check to unique editorTool id
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
    toolId,
  }: RemoveUserEditorTool): Promise<void> {
    await this.model.update({
      editorTools: fn('array_remove', col('editor_tools'), toolId),
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
    return await this.model.create({
      email,
      name,
      createdAt: new Date(),
      photo,
    });
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

    return user;
  }
}
