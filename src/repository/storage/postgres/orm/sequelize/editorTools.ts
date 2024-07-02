import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes, Op } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type EditorTool from '@domain/entities/editorTools.js';
import { UserModel } from './user.js';
import type { EditorToolCreationAttributes } from '@domain/entities/editorTools.js';

/**
 * Class representing an EditorTool model in database
 */
export class EditorToolModel extends Model<InferAttributes<EditorToolModel>, InferCreationAttributes<EditorToolModel>> {
  /**
   * Editor tool unique id
   */
  public declare id: CreationOptional<EditorTool['id']>;

  /**
   * Custom name that uses in editor initialization. e.g. 'code'
   */
  public declare name: EditorTool['name'];

  /**
   * Editor tool title. e.g. 'Code tool 3000'
   */
  public declare title: EditorTool['title'];

  /**
   * User tool class name. e.g. 'CodeTool'
   */
  public declare exportName: EditorTool['exportName'];

  /**
   * Editor tool sources
   */
  public declare source: EditorTool['source'];

  /**
   * Editor tool description
   */
  public declare description: EditorTool['description'];

  /**
   * Cover image for the tool
   */
  public declare cover: EditorTool['cover'];

  /**
   * Applies to user editor tools by default
   */
  public declare isDefault: EditorTool['isDefault'];

  /**
   * User id that added the tool to the marketplace
   */
  public declare userId: UserModel['id'] | null;
}

/**
 * Class representing a table storing users
 */
export default class UserSequelizeStorage {
  /**
   * User model in database
   */
  public model: typeof EditorToolModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'editor_tools';

  /**
   * Constructor for the storage
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate model
     */
    this.model = EditorToolModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
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
        defaultValue: null,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      exportName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      source: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cover: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * @param options - tool data to identify and connect to the editor
   */
  public async addTool({
    name,
    title,
    exportName,
    description,
    cover,
    userId,
    source,
    isDefault,
  }: EditorToolCreationAttributes): Promise<EditorTool> {
    return await this.model.create({
      name,
      userId,
      title,
      description,
      cover,
      exportName,
      source,
      isDefault,
    });
  }

  /**
   * Get bunch of tools by their ids
   * @param editorToolIds - tool ids
   */
  public async getToolsByIds(editorToolIds: EditorTool['id'][]): Promise<EditorTool[]> {
    return await this.model.findAll({
      where: {
        id: {
          [Op.in]: editorToolIds,
        },
      },
    });
  }

  /**
   * Get tool by it's identifier
   * @param editorToolId - unique tool identifier
   */
  public async getToolById(editorToolId: EditorTool['id']): Promise<EditorTool | null> {
    return await this.model.findByPk(editorToolId);
  }

  /**
   * Get all default tools
   */
  public async getDefaultTools(): Promise<EditorTool[]> {
    return await this.model.findAll({
      where: {
        isDefault: true,
      },
    });
  }

  /**
   * Get all available editor tools
   */
  public async getTools(): Promise<EditorTool[]> {
    return await EditorToolModel.findAll();
  }

  /**
   * Update tool cover
   * @param editorToolId
   * @param cover
   */
  public async updateToolCover(editorToolId: EditorTool['id'], cover: EditorTool['cover']): Promise<void> {
    await this.model.update({
      cover,
    }, {
      where: {
        $id$: editorToolId,
      },
    });
  }
}
