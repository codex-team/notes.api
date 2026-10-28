import type { Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model, DataTypes, literal } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type McpToken from '@domain/entities/mcpToken.js';
import type { McpTokenCreationAttributes, McpTokenPermission } from '@domain/entities/mcpToken.js';

/**
 * Length of sha256 hex digest
 */
const TOKEN_HASH_LENGTH = 64;

/**
 * Max length of the token preview
 */
const PREVIEW_MAX_LENGTH = 4;

/**
 * Max length of the permission name
 */
const PERMISSION_MAX_LENGTH = 5;

/**
 * Max length of the token label
 */
const LABEL_MAX_LENGTH = 255;

/**
 * Class representing an MCP token model in database
 */
class McpTokenModel extends Model<InferAttributes<McpTokenModel>, InferCreationAttributes<McpTokenModel>> {
  /**
   * Token id
   */
  public declare id: CreationOptional<number>;

  /**
   * Token owner id
   */
  public declare userId: McpToken['userId'];

  /**
   * Sha256 hash of the token
   */
  public declare tokenHash: string;

  /**
   * Last characters of the token
   */
  public declare preview: string;

  /**
   * What MCP client can do with notes of the token owner
   */
  public declare permission: McpTokenPermission;

  /**
   * Label set by user
   */
  public declare label: string;

  /**
   * Last time token was used
   */
  public declare lastUsedAt: CreationOptional<Date | null>;

  /**
   * How many times token was used
   */
  public declare requestCount: CreationOptional<number>;

  /**
   * When token was created
   */
  public declare createdAt: CreationOptional<Date>;
}

/**
 * Class representing a table storing MCP tokens
 */
export default class McpTokenSequelizeStorage {
  /**
   * MCP tokens model in database
   */
  public model: typeof McpTokenModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'mcp_tokens';

  /**
   * Constructor for MCP tokens storage
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate MCP tokens model
     */
    this.model = McpTokenModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel,
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tokenHash: {
        type: DataTypes.CHAR(TOKEN_HASH_LENGTH),
        allowNull: false,
        unique: true,
      },
      preview: {
        type: DataTypes.STRING(PREVIEW_MAX_LENGTH),
        allowNull: false,
      },
      permission: {
        type: DataTypes.STRING(PERMISSION_MAX_LENGTH),
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING(LABEL_MAX_LENGTH),
        allowNull: false,
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      requestCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Creates MCP token
   * @param attributes - token owner, hash, preview, permission and label
   * @returns created MCP token
   */
  public async create(attributes: McpTokenCreationAttributes): Promise<McpToken> {
    return await this.model.create(attributes);
  }

  /**
   * Finds all MCP tokens of the user, newest first
   * @param userId - token owner id
   * @returns list of MCP tokens
   */
  public async findByUserId(userId: McpToken['userId']): Promise<McpToken[]> {
    return await this.model.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Finds MCP token by its hash
   * @param tokenHash - sha256 hash of the token
   * @returns found MCP token
   */
  public async findByTokenHash(tokenHash: McpToken['tokenHash']): Promise<McpToken | null> {
    return await this.model.findOne({
      where: { tokenHash },
    });
  }

  /**
   * Removes MCP token of the user
   * @param id - token id
   * @param userId - token owner id
   * @returns true if token was removed
   */
  public async removeById(id: McpToken['id'], userId: McpToken['userId']): Promise<boolean> {
    const removedCount = await this.model.destroy({
      where: {
        id,
        userId,
      },
    });

    return removedCount > 0;
  }

  /**
   * Increments request counter and updates last usage time of the token in one query
   * @param id - token id
   */
  public async trackUsage(id: McpToken['id']): Promise<void> {
    await this.model.update({
      requestCount: literal('request_count + 1'),
      lastUsedAt: literal('NOW()'),
    }, {
      where: { id },
    });
  }
}
