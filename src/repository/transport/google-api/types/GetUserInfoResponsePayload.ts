/**
 * Interface for the response payload of the Google API's get user info.
 */
interface GetUserInfoSuccessfulResponsePayload {
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

/**
 * Interface for the error response payload of the Google API's get user info.
 */
interface GetUserInfoErrorResponsePayload {
  /**
   * Error
   */
  error: {
    /**
     * Error message
     */
    message: string;
  }
}

export type GetUserInfoResponsePayload = GetUserInfoSuccessfulResponsePayload | GetUserInfoErrorResponsePayload;
