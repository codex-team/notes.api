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
   * Get all users
   */
  public async getAllUsers(): Promise<UserList>  {
    return await this.repository.getAllUsers();
  }
}