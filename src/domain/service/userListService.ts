import type  User from '@domain/entities/user';
import type UserListRepository from '@repository/userList.repository';


/**
 *
 */
export default class UserListService {
  public readonly repository: UserListRepository;

  /**
   *
   * @param repository
   */
  constructor(repository: UserListRepository) {
    this.repository = repository;
  }

  /**
   *
   */
  public async getAllUsers(): Promise<User[]>  {
    return await this.repository.getAllUsers();
  }
}