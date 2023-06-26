import User from '@domain/entities/user.js';
import UserRepository from '@repository/user.repository.js';

/**
 * Add user options
 */
export interface AddUserOptions {
  /**
   * User email address
   */
  email: string;
}

/**
 * Get user options
 */
export interface GetUserOptions {
  /**
   * User id
   */
  id?: number;

  /**
   * User email address
   */
  email?: string;
}

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
  public async addUser({ email }: AddUserOptions): Promise<User> {
    const user = new User(email);

    return this.repository.addUser(user);
  }

  /**
   * Get user
   *
   * @param options - get user options
   * @returns { Promise<User | undefined> } found user
   */
  public async getUser({ email, id }: GetUserOptions): Promise<User | undefined> {
    const user = new User(email, id);

    return await this.repository.getUser(user);
  }
}
