/**
 * Interface for the response payload of the Google API's get user info.
 */
export default interface GetUserInfoResponsePayload {
  /**
   * User email
   */
  email: string;

  /**
   * Is email verified
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  verified_email: boolean;

  /**
   * User name
   */
  name: string;

  /**
   * Avatar picture URL
   */
  picture: string;
}

