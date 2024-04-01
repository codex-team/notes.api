import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type User from '@domain/entities/user.js';
import { UserModel } from './user.js';
import type UploadedFile from '@domain/entities/file.js';
import type { FileCreationAttributes, FileLocation, FileTypes } from '@domain/entities/file.js';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';

/**
 * Class representing a file model in database
 */
export class FileModel extends Model<InferAttributes<FileModel>, InferCreationAttributes<FileModel>> {
  /**
   * File id
   */
  public declare id: CreationOptional<UploadedFile['id']>;

  /**
   * File unique hash which stores in some object storage
   */
  public declare key: UploadedFile['key'];

  /**
   * User who uploaded the file
   */
  public declare userId: CreationOptional<User['id']>;

  /**
   * File uploaded at
   */
  public declare createdAt: CreationOptional<UploadedFile['createdAt']>;

  /**
   * File name (e.g. `image`)
   */
  public declare name: UploadedFile['name'];

  /**
   * File extension (e.g. `image/png`)
   */
  public declare mimetype: UploadedFile['mimetype'];

  /**
   * File type, using to store in object storage
   */
  public declare type: FileTypes;

  /**
   * File size in bytes
   */
  public declare size: UploadedFile['size'];

  /**
   * Object, which stores information about file location
   */
  public declare location: FileLocation;
}

/**
 * Class representing a table storing files
 */
export default class FileSequelizeStorage {
  /**
   * File model in database
   */
  public model: typeof FileModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'files';

  /**
   * Constructor for file storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;
    this.model = FileModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        key: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: UserModel,
            key: 'id',
          },
        },
        createdAt: DataTypes.DATE,
        mimetype: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        type: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        location: {
          type: DataTypes.JSONB,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        updatedAt: false,
        sequelize: this.database,
        tableName: this.tableName,
      }
    );
  }

  /**
   * Inserts file data into database
   *
   * @param fileData - File data
   */
  public async insertFile(fileData: FileCreationAttributes): Promise<UploadedFile> {
    return await this.model.create(fileData);
  }

  /**
   * Get file data by key
   *
   * @param key - File key
   */
  public getFileDataByKey(key: string): Promise<UploadedFile | null> {
    return this.model.findOne({
      where: {
        key,
      },
    });
  }
}
