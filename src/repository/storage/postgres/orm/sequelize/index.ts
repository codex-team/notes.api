import { DatabaseConfig } from '@infrastructure/config/index.js';
import { Sequelize } from 'sequelize';
import { getLogger } from '@infrastructure/logging/index.js';

const databaseLogger = getLogger('database');

/**
 * Class for creating database connection
 */
export default class SequelizeOrm {
  /**
   * Database configuration
   */
  private config: DatabaseConfig;

  /**
   * Database instance
   */
  private readonly conn: Sequelize;

  /**
   * Constructor for class
   *
   * @param databaseConfig - database config
   */
  constructor(databaseConfig: DatabaseConfig) {
    this.config = databaseConfig;

    this.conn = new Sequelize(this.config.dsn, {
      logging: databaseLogger.info.bind(databaseLogger),
    });
  }

  /**
   * Test the connection by trying to authenticate
   */
  public async authenticate(): Promise<void> {
    /**
     * Make sure that database is connected
     */
    try {
      await this.conn.authenticate();
      databaseLogger.info(`Database connected to ${this.conn.config.host}:${this.conn.config.port}`);
    } catch (error) {
      databaseLogger.error('Unable to connect to the database:', error);
    }
  }

  /**
   * Get database connection
   */
  public get connection(): Sequelize  {
    return this.conn;
  }
}
