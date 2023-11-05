import type UserListRepository from '@repository/userList.repository';
import type { UserList } from '@domain/entities/userList';

/**
 * User list service
 */
export default class UserListService {
  /**
   * User list repository
   */
  public repository: UserListRepository;

  /**
   * Number of users shown in one portion
   */
  private readonly portionSize = 30;

  /**
   * User list service constructor
   *
   * @param repository - user list repository
   */
  constructor(repository: UserListRepository) {
    this.repository = repository;
  }

  /**
   * Returns all users
   *
   * @param page - number of current page
   * @returns { Promise<UserList> } user
   */
  public async getUserList(page: number): Promise<UserList> {
    const offset = (page - 1) * this.portionSize;

    return {
      items: await this.repository.getUserList(offset, this.portionSize),
    };
  }
}
