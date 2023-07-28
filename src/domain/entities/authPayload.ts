/**
 * Auth payload interface, which is encoded in the access token, decoded when the token is verified
 */
export default interface AuthPayload {
  /**
   * User id
   */
  id: number;
}
