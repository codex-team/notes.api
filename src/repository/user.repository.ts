import type User from '@domain/entities/user.js';
import type UserStorage from '@repository/storage/user.storage.js';
import type GoogleApiTransport from '@repository/transport/google-api/index.js';
import type GetUserInfoResponsePayload from '@repository/transport/google-api/types/GetUserInfoResponsePayload.js';
import type { AddUserToolOptions } from '@repository/storage/postgres/orm/sequelize/user.js';
import type EditorTool from '@domain/entities/editorTools.js';

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
 * Remove link to a tool from a user
 */
interface RemoveUserEditorToolOptions {
  /**
   * User identifier
   */
  userId: User['id'];

  /**
   * Editor tool identifier
   */
  toolId: EditorTool['id'];
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
   * Get all user information by it's identifier
   *
   * @param userId - unique user numeric identifier
   * @returns { Promise<User | null> } found user
   */
  public async getUserById(userId: User['id']): Promise<User | null> {
    return this.storage.getUserByIdOrEmail({
      id: userId,
    });
  }

  /**
   * Get user data from oauth provider, create user if not exists
   *
   * @param accessToken - provider access token
   * @param provider - provider
   * @returns { Promise<User | null> } found user
   */
  public async getOrCreateUserByProvider(accessToken: string, provider: Provider): Promise<User | null> {
    let res: GetUserInfoResponsePayload | null;

    /**
     * Get user info from provider
     */
    switch (provider) {
      case Provider.GOOGLE:
        /**
         * Get user info from Google api
         */
        res = await this.googleApiTransport.getWithAccessToken<GetUserInfoResponsePayload>('/userinfo', accessToken);
        break;
      default:
        /**
         * Provider not found
         */
        return null;
    }

    if (!res) {
      /**
       * User not found in provider
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

    return await this.storage.insertUser({
      email: res.email,
      photo: res.picture,
      name: res.name,
      editorTools: [],
    });
  }

  /**
   * Adding link between user and tool
   *
   * @param options - identifiers of user and tool
   */
  public async addUserEditorTool({ userId, toolId }: AddUserToolOptions): Promise<void> {
    await this.storage.addUserEditorTool({
      userId,
      toolId,
    });
  }

  /**
   * Removing link between user and tool
   *
   * @param options - identifiers of user and tool
   */
  public async removeUserEditorTool({ userId, toolId }: RemoveUserEditorToolOptions): Promise<void> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new Error('There is no user with such id');
    }

    const editorTool = user.editorTools?.find(id => id === toolId);

    if (editorTool === undefined) {
      throw new Error('User has no tool with such id');
    }

    await this.storage.removeUserEditorTool({
      userId,
      toolId: editorTool,
    });
  }
}
