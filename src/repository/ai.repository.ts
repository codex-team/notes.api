import { notEmpty } from '@infrastructure/utils/empty.js';
import type OpenAIApi from './transport/openai-api/index.js';
import type { GetCompletionResponsePayload } from './transport/openai-api/types/GetCompletionResponsePayload.js';

/**
 * Repository that establishes access to data from business logic
 */
export default class AIRepository {
  /**
   * Constructs repository instance
   *
   * @param openaiTransport - openai transport
   */
  constructor(private readonly openaiTransport: OpenAIApi) { }

  /**
   * Returns predicted completion based on specified string content
   *
   * @param content - content to complete
   */
  public async getCompletion(content: string): Promise<string> {
    const body = {
      model: 'gpt-3.5-turbo-16k',
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    };

    const response = await this.openaiTransport.postWithToken<GetCompletionResponsePayload>('/chat/completions', body);

    if (response !== null && notEmpty(response.choices[0].message.content)) {
      return response.choices[0].message.content;
    }

    return  '';
  }
}
