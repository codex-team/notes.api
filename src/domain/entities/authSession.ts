/**
 * Auth entity, contains access and refresh tokens to send to client, when user is logged in or regenerates tokens
 */
export default interface AuthSession {
  accessToken: string;
  refreshToken: string;
}
