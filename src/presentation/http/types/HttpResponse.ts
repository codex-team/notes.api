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
   * Error code
   */
  code: number;

  /**
   * Error message code
   */
  message: string;
}

export {
  SuccessResponse,
  ErrorResponse
};

