interface SuccessResponse<Payload> {
  /**
   * Response data
   */
  data: Payload;
}

/**
 * Error response
 */
interface ErrorResponse {
  /**
   * Status code
   */
  status: number;

  /**
   * Error message code
   */
  message: string;
}

export type {
  SuccessResponse,
  ErrorResponse
};

