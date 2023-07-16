/**
 * Google API response interface
 *
 * @template Payload - Response payload type
 */
export default interface ApiResponse<Payload> {
  /**
   * Response status
   */
  status: number;

  /**
   * Response data
   */
  data: Payload;
}
