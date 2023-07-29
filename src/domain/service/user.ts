import type UserRepository from '@repository/user.repository.js';
import { Provider } from '@repository/user.repository.js';
import type User from '@domain/entities/user.js';

export {
  Provider
};

/**
 * User service
 */
export default class UserService {
  /**
   * User repository instance
   */
  private readonly repository: UserRepository;

  /**
   * User service constructor
   *
   * @param repository - user repository instance
   */
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  /**
   * Get user by it's identifier
   *
   * @param userId - unique user identifier
   * @returns { Promise<User | null> } found user
   */
  public async getUserById(userId: User['id']): Promise<User | null> {
    return await this.repository.getUserById(userId);
  }

  /**
   * Get user by provider
   *
   * @param accessToken - provider access token
   * @param provider - provider
   * @returns { Promise<User | null> } found user
   */
  public async getUserByProvider(accessToken: string, provider: Provider): Promise<User | null> {
    return await this.repository.getOrCreateUserByProvider(accessToken, provider);
  }
}
