import type { Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Model, DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type EditorTool from '@domain/entities/editorTools.js';


interface AddToolOptions {
    id: EditorTool['id'];
    name: EditorTool['name'];
    class: EditorTool['class'];
    source: EditorTool['source'];
}

/**
 * Class representing an EditorTool model in database
 */
export class EditorToolModel extends Model<InferAttributes<EditorToolModel>, InferCreationAttributes<EditorToolModel>> {
  /**
   * Editor tool unique id
   */
  public declare id: EditorTool['id'];

  /**
   * Editor tool title
   */
  public declare name: EditorTool['name'];

  /**
   * User tool class name
   */
  public declare class: EditorTool['class'];

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
      class: {
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
    class: editorToolClass,
    source,
  }: AddToolOptions): Promise<EditorTool> {
    const editorTool = await this.model.create({
      id,
      name,
      class: editorToolClass,
      source,
    });

    return editorTool;
  }

  /**
   * Get all available editor tools
   */
  public async getTools(): Promise<EditorTool[]> {
    const editorTools = await EditorToolModel.findAll();

    return editorTools;
  }
}
