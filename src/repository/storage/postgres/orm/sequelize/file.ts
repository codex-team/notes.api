import type { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type UploadedFile from '@domain/entities/file.js';
import type { FileCreationAttributes, FileType, FileLocation, FileLocationByType } from '@domain/entities/file.js';
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
   * Additional data about uploaded file
   */
  public declare metadata: UploadedFile['metadata'];

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
  public declare type: FileType;

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
        metadata: {
          type: DataTypes.JSONB,
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
   * @param fileData - File data
   */
  public async insertFile(fileData: FileCreationAttributes): Promise<UploadedFile> {
    return await this.model.create(fileData);
  }

  /**
   * Get file data by key
   * @param key - File key
   */
  public getFileDataByKey(key: string): Promise<UploadedFile | null> {
    return this.model.findOne({
      where: {
        key,
      },
    });
  }

  /**
   * Get file location by key and type
   * @param type - file type
   * @param key - file unique key
   */
  public async getFileLocationByKey<T extends FileType>(type: T, key: UploadedFile['key']): Promise<FileLocationByType[T] | null> {
    const res = await this.model.findOne({
      where: {
        key,
        type,
      },
    });

    if (res === null) {
      return null;
    }

    return res.location as FileLocationByType[T];
  }

  /**
   * Delete file
   * @param key - file key
   * @returns true if file deleted
   */
  public async delete(key: UploadedFile['key']): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        key,
      },
    });

    /**
     * If file not found return false
     */
    return affectedRows > 0;
  }
}
