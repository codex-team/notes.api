import type  User from '@domain/entities/user';
import type UserListRepository from '@repository/userList.repository';


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
  public async getAllUsers(): Promise<User[]>  {
    return await this.repository.getAllUsers();
  }
}