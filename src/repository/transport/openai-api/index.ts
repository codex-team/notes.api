import Transport from '@repository/transport/index.js';
import appConfig from '@infrastructure/config/index.js'; // @todo get rid of import from infrastructure
import type { ApiResponse } from '../google-api/types/ApiResponse';

/**
 * OpenAI transport
 */
export default class OpenAIApi extends Transport {
  /**
   * Constructs OpenAI api tranport instance
   *
   * @param baseUrl - Base url for the api
   */
  constructor(baseUrl: string = 'https://api.openai.com/v1') {
    super(baseUrl);
  }

  /**
   * Make GET request with authorization to OpenAI API
   *
   * @param endpoint - api endpoint
   * @param data
   */
  public async postWithToken<ResponsePayload>(endpoint: string, data: unknown): Promise<ResponsePayload | null> {
    const headers = {
      Authorization: `Bearer ${appConfig.openai.token}`,
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      'Content-Type': 'application/json',
    };

    const res = await super.post<ApiResponse>(endpoint, headers, JSON.stringify(data));

    if ('error' in res) {
      /**
       * TODO: handle error, throw error
       */
      return null;
    }

    return res as ResponsePayload;
  }
}
