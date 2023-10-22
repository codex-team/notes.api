import type UserListRepository from '@repository/userList.repository';
import type { UserList } from '@domain/entities/userList';


/**
 * User List service 
 */
export default class UserListService {
  public readonly repository: UserListRepository;

  /**
   * User List service constructor 
   * @param repository - userList repository instance 
   */
  constructor(repository: UserListRepository) {
    this.repository = repository;
  }

  /**
   * Returns all users
   *
   * @returns { Promise<UserList> } user
   */
  public async getUserList(): Promise<UserList>  {
    return {
      users: await this.repository.getUserList(),
    };
  }
}