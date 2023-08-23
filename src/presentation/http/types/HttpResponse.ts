/**
 * Error response
 */
export interface ErrorResponse {
  /**
   * Message identifier used for translation on client side
   *
   * NOT HTTP STATUS CODE — it will be send in `status` field
   */
  code?: number;

  /**
   * Message text for better DX. Should not be showed to users.
   */
  message?: string;
}
