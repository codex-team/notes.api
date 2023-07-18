import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import Orm from '@repository/storage/postgres/orm/sequelize/index.js';

/**
 * Class representing oauth providers model in database
 */
export class OAuthProvidersModel extends Model<InferAttributes<OAuthProvidersModel>, InferCreationAttributes<OAuthProvidersModel>> {
  /**
   * Provider id
   */
  public declare id: CreationOptional<number>;

  /**
   * OAuth provider name
   */
  public declare name: string;
}


/**
 * Class representing a table storing oauth providers
 */
export default class OAuthProvidersSequelizeStorage {
  /**
   * Oauth providers model in database
   */
  public model: typeof OAuthProvidersModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'oauth_providers';

  /**
   * Constructor for oauth providers storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate oauth providers model
     */
    this.model = OAuthProvidersModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
    });
  }
}
