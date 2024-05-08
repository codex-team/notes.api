/**
 * Interface for the response payload of the OpenAI completion endpoint
 */
export type GetCompletionResponsePayload = {
  /**
   * Completion id
   */
  id: string;

  /**
   * ???
   */
  object: string;
  /**
   * Id of the model to use
   */
  model: string;

  /**
   * Completion created date
   */
  created: number;

  /**
   * ???
   */
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
  }>;
};
