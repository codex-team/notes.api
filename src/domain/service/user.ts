import User from '@domain/entities/user.js';
import UserRepository from '@repository/user.repository.js';

/**
 * User service
 */
export default class UserService {
  /**
   * User repository
   */
  public repository: UserRepository;

  /**
   * User service constructor
   *
   * @param repository - user repository instance
   */
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  /**
   * Add user
   *
   * @param email - user email address
   * @returns { Promise<User> } added user
   */
  public async addUser(email: string): Promise<User> {
    const user = new User(email);

    return this.repository.addUser(user);
  }

  /**
   * Get user
   *
   * @param email - user email address
   * @param id - user id
   * @returns { Promise<User | undefined> } found user
   */
  public async getUser(email?: string, id?: number): Promise<User | null> {
    const user = new User(email, id);

    return await this.repository.getUser(user);
  }
}
