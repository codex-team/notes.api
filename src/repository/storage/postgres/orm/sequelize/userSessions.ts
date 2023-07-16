import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import { OAuthProvidersModel } from '@repository/storage/postgres/orm/sequelize/oauthProviders.js';

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
   * Oauth provider
   */
  public declare provider_id: number;

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
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: OAuthProvidersModel,
          key: 'id',
        },
      },
      refresh_token: {
        type: DataTypes.STRING,
        allowNull: false,
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
}
