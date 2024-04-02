import type NoteRepository from '@repository/note.repository.js';
import type { NoteList } from '@domain/entities/noteList.js';

/**
 * Note list service
 */
export default class NoteListService {
  /**
   * Note repository
   */
  public repository: NoteRepository;

  /**
   * Number of notes shown in one portion
   */

  private readonly portionSize = 30;

  /**
   * Note service constructor
   *
   * @param repository - note repository
   */
  constructor(repository: NoteRepository) {
    this.repository = repository;
  }

  /**
   * Returns note list by creator id
   *
   * @param id - note creator id
   * @param page - number of current page
   * @returns { Promise<NoteList> } note
   */
  public async getNoteListByCreatorId(id: number, page: number): Promise<NoteList> {
    const offset = (page - 1) * this.portionSize;

    return {
      items: await this.repository.getNoteListByCreatorId(id, offset, this.portionSize),
    };
  }
}
