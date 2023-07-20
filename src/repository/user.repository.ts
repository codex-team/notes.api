import User from '@domain/entities/user.js';
import UserStorage from './storage/user.storage.js';
import GoogleApiTransport from '@repository/transport/google-api/index.js';
import { GetUserInfoResponsePayload } from '@repository/transport/google-api/types/GetUserInfoResponsePayload';

/**
 * OAuth provider
 */
export enum Provider {
  /**
   * Google provider
   */
  GOOGLE = 'google',
}

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class UserRepository {
  /**
   * User storage instance
   */
  public storage: UserStorage;

  /**
   * Google API transport
   */
  private readonly googleApiTransport: GoogleApiTransport;

  /**
   * User repository constructor
   *
   * @param storage - storage for user
   * @param googleApiTransport - google api transport
   */
  constructor(storage: UserStorage, googleApiTransport: GoogleApiTransport) {
    this.googleApiTransport = googleApiTransport;
    this.storage = storage;
  }

  /**
   * Get user by provider
   *
   * @param accessToken - provider access token
   * @param provider - provider
   * @returns { Promise<User | null> } found user
   */
  public async getUserByProvider(accessToken: string, provider: Provider): Promise<User | null> {
    let res: GetUserInfoResponsePayload;

    /**
     * Set request headers
     */
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    /**
     * Get user info from provider
     */
    switch (provider) {
      case Provider.GOOGLE:
        /**
         * Get user info from Google api
         */
        res = await this.googleApiTransport.get<GetUserInfoResponsePayload>('/userinfo', headers);
        break;
      default:
        /**
         * Provider not found
         */
        return null;
    }

    /**
     * Check if error in response
     */
    if ('error' in res) {
      /**
       * TODO: handle error
       */
      return null;
    }

    /**
     * Check if user exists in database
     */
    const user = await this.storage.getUserByIdOrEmail({
      email: res.email,
    });

    /**
     * Return user if exists
     */
    if (user) {
      return user;
    }

    return await this.storage.insertUser(res.email, res.name);
  }
}
