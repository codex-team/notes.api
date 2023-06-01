import { DatabaseConfig } from '@infrastructure/config/index.js';
import { Sequelize } from 'sequelize';
import { getLogger } from '@infrastructure/logging/index.js';
import Storage from '@repository/storage.interface.js';

const databaseLogger = getLogger('database');

/**
 * Class for creating database connection
 */
export default class Database implements Storage {
  /**
   * Database configuration
   */
  private config: DatabaseConfig;

  /**
   * Constructor for class
   *
   * @param databaseConfig - database config
   */
  constructor(databaseConfig: DatabaseConfig) {
    this.config = databaseConfig;
  }

  /**
   * Connect to database
   *
   * @returns { Sequelize } - database instance
   */
  public async connect(): Promise<Sequelize> {
    const seq = new Sequelize(this.config.url, {
      logging: databaseLogger.info.bind(databaseLogger),
    });

    /**
     * Make sure that database is connected
     */
    try {
      await seq.authenticate();
      databaseLogger.info(`Database connected to ${seq.config.host}:${seq.config.port}`);
    } catch (error) {
      databaseLogger.error('Unable to connect to the database:', error);
    }

    return seq;
  }
}
