/**
 * DomainError entity — manually thrown exception provided by business logic
 */
export class DomainError extends Error {
  /**
   * @param message - description of why the error was thrown
   */
  constructor(message: string) {
    super(message);
  }
}
