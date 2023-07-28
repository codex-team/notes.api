import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type UserSession from '@domain/entities/userSession';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Class representing a user sessions model in database
 */
class UserSessionModel extends Model<InferAttributes<UserSessionModel>, InferCreationAttributes<UserSessionModel>> {
  /**
   * Session id
   */
  public declare id: CreationOptional<number>;

  /**
   * User id
   */
  public declare user_id: number;

  /**
   * Refresh token
   */
  public declare refresh_token: string;

  /**
   * Refresh token expiration date
   */
  public declare refresh_token_expires_at: Date;
}


/**
 * Class representing a table storing user sessions
 */
export default class UserSessionSequelizeStorage {
  /**
   * User sessions model in database
   */
  public model: typeof UserSessionModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'user_sessions';

  /**
   * Constructor for user sessions storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate user sessions model
     */
    this.model = UserSessionModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel,
          key: 'id',
        },
      },
      refresh_token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      refresh_token_expires_at: {
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
   * Creates user session
   *
   * @param userId - user id
   * @param refreshToken - refresh token
   * @param refreshTokenExpiresAt - refresh token expiration date
   * @returns { UserSession } created user session
   */
  public async create(userId: number, refreshToken: string, refreshTokenExpiresAt: Date): Promise<UserSession> {
    const session = await this.model.create({
      user_id: userId,
      refresh_token: refreshToken,
      refresh_token_expires_at: refreshTokenExpiresAt,
    });

    return {
      id: session.id,
      userId: session.user_id,
      refreshToken: session.refresh_token,
      refreshTokenExpiresAt: session.refresh_token_expires_at,
    };
  }

  /**
   * Finds user session by refresh token
   *
   * @param token - refresh token
   * @returns { UserSession | null } found user session
   */
  public async findByToken(token: string): Promise<UserSession | null> {
    const session = await this.model.findOne({
      where: { refresh_token: token },
    });

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.user_id,
      refreshToken: session.refresh_token,
      refreshTokenExpiresAt: session.refresh_token_expires_at,
    };
  }

  /**
   * Removes user session by refresh token
   *
   * @param refreshToken - refresh token
   * @returns { void }
   */
  public async removeByRefreshToken(refreshToken: string): Promise<void> {
    await this.model.destroy({
      where: { refresh_token: refreshToken },
    });
  }
}
