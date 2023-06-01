import { Sequelize } from 'sequelize';

/**
 * Interface for creating database connection
 */
export default interface Storage {
  /**
   * Connect to database
   *
   * @returns { Sequelize } - database instance
   */
  connect(): Promise<Sequelize>;
}
