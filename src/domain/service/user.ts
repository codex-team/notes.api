import type UserRepository from '@repository/user.repository.js';
import { Provider } from '@repository/user.repository.js';
import type User from '@domain/entities/user.js';
import type EditorTool from '@domain/entities/editorTools';
import type EditorToolSharedMethods from './shared/editorTools.js';
import { DomainError } from '@domain/entities/DomainError.js';

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
   * @param editorToolsSharedService - shared methods of editorToolService
   */
  constructor(repository: UserRepository, private readonly editorToolsSharedService: EditorToolSharedMethods) {
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

  /**
   * Get user editor tools ids
   *
   * @param userId - user unique identifier
   */
  public async getUserEditorTools(userId: User['id']): Promise<EditorTool[]> {
    const user = await this.getUserById(userId);

    if (user === null) {
      throw new DomainError('User not found');
    }

    const userToolsIds = user.editorTools ?? [];
    const defaultTools = await this.editorToolsSharedService.getDefaultTools();
    const uniqueDefaultEditorTools = defaultTools.filter(({ id }) => !userToolsIds.includes(id));
    const userTools = await this.editorToolsSharedService.getToolsByIds(userToolsIds) ?? [];

    /**
     * Combine user tools and default tools
     *
     * @todo load tools in notes service
     */
    return [...userTools, ...uniqueDefaultEditorTools];
  }

  /**
   * Adds editor tool to user settings by its id
   *
   * @param options - user id & editor tool
   */
  public async addUserEditorTool({
    userId,
    toolId,
  }: {
    userId: User['id'],
    toolId: EditorTool['id'],
  }): Promise<EditorTool> {
    const toolToAdd =  await this.editorToolsSharedService.getToolById(toolId);

    if (toolToAdd === null) {
      throw new DomainError('Editor tool not found');
    }

    await this.repository.addUserEditorTool({
      userId,
      toolId,
    });

    return toolToAdd;
  }

  /**
   * Removes editor tool from user settings by its id
   *
   * @param options - user id & editor tool
   */
  public async removeUserEditorTool({
    userId,
    toolId,
  }: {
    userId: User['id'],
    toolId: EditorTool['id'],
  }): Promise<void> {
    return await this.repository.removeUserEditorTool({
      userId,
      toolId,
    });
  }
}
