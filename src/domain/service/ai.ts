import type AIRepository from '@repository/ai.repository';

/**
 * AI service
 */
export default class AIService {
  /**
   * Constructs AI service instance
   *
   * @param repository - AI repository instance
   */
  constructor(private readonly repository: AIRepository) {}


  /**
   * Returns predicted completion based on specified string content
   *
   * @param content - content to complete
   */
  public async getCompletion(content: string): Promise<string> {
    return await this.repository.getCompletion(content);
  }
}
