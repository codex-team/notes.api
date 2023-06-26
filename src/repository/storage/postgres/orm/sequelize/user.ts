import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import Orm from '@repository/storage/postgres/orm/sequelize/index.js';

/**
 * Interface for inserted user
 */
interface InsertedUser {
  /**
   * User id
   */
  id: number;

  /**
   * User email address
   */
  email: string;
}

/**
 * Class representing a user model in database
 */
class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  /**
   * Note id
   */
  public declare id: CreationOptional<number>;

  /**
   * User email address
   */
  public declare email: string;
}


/**
 * Class representing a table storing User
 */
export default class UserSequelizeStorage {
  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * User model in database
   */
  private model: typeof UserModel;

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
     * Initiate note model
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
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
    });
  }

  /**
   * Insert user to database
   *
   * @param email - user email address
   * @returns { InsertedUser } - inserted user
   */
  public async insertUser(email: string): Promise<InsertedUser> {
    const insertedNote = await this.model.create({
      email,
    });

    return {
      id: insertedNote.id,
      email: insertedNote.email,
    };
  }

  /**
   * Get user by email
   *
   * @param email - user email address
   * @returns { InsertedUser } - user
   */
  public async getUserByEmail(email: string): Promise<InsertedUser | undefined> {
    const user = await this.model.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  /**
   * Get user by id
   *
   * @param id - user id
   * @returns { InsertedUser } - user
   */
  public async getUserById(id: number): Promise<InsertedUser | undefined> {
    const user = await this.model.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      return;
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
