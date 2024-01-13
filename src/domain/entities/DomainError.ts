/**
 * DomainError entity
 */
export class DomainError extends Error {
  /**
   * @param message - description of why the error was thrown
   */
  constructor(message: string) {
    super(message);
  }
}
