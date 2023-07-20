import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import User from '@domain/entities/user';

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
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Insert user
   *
   * @param email - user email
   * @param name - user name
   * @returns { Promise<User> } inserted user
   */
  public async insertUser(email: string, name: string): Promise<User> {
    const user = await this.model.create({
      email,
      name,
      created_at: new Date(),
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
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
    if (id) {
      /**
       * Find user by id
       */
      user = await this.model.findOne({
        where: {
          id,
        },
      });
    } else if (email) {
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
    };
  }
}