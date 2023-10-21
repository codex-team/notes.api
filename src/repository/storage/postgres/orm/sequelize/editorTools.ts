import type { Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Model, DataTypes, Op } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type EditorTool from '@domain/entities/editorTools.js';

/**
 * Class representing an EditorTool model in database
 */
export class EditorToolModel extends Model<InferAttributes<EditorToolModel>, InferCreationAttributes<EditorToolModel>> {
  /**
   * Editor tool unique id, Nano-ID
   */
  public declare id: EditorTool['id'];

  /**
   * Custom name that uses in editor initiazliation. e.g. 'code'
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
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate model
     */
    this.model = EditorToolModel.init({
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
    id,
    name,
    title,
    exportName,
    source,
  }: EditorTool): Promise<EditorTool> {
    const editorTool = await this.model.create({
      id,
      name,
      title,
      exportName,
      source,
    });

    return editorTool;
  }

  /**
   * Get bunch of tools by their ids
   *
   * @param editorToolIds - tool ids
   */
  public async getToolsByIds(editorToolIds: EditorTool['id'][]): Promise<EditorTool[]> {
    const editorTools = await this.model.findAll({
      where: {
        id: {
          [Op.in]: editorToolIds,
        },
      },
    });

    return editorTools;
  }

  /**
   * Get all available editor tools
   */
  public async getTools(): Promise<EditorTool[]> {
    const editorTools = await EditorToolModel.findAll();

    return editorTools;
  }
}
