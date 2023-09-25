/**
 * API interface
 */
export default interface Server {
  /**
   * Runs API module
   */
  run(): Promise<void>;
}
