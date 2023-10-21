import type  User from '@domain/entities/user';
import type UserListRepository from '@repository/userList.repository';


export default class UserListService {
    public readonly repository: UserListRepository;

    constructor(repository: UserListRepository) {
        this.repository = repository;
      }
    
    public async getAllUsersById(): Promise<User[]>  {
      return await this.repository.getAllUsersById();
    }
  
  }