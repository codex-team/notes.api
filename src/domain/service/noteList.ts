import type NoteRepository from '@repository/note.repository';
import type { NoteList } from '@domain/entities/noteList';

/**
 * Note list service
 */
export default class NoteListService {
  /**
   * Note repository
   */
  public repository: NoteRepository;

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
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   * @returns { Promise<NoteList> } note
   */
  public async getNoteListByCreatorId(id: number, offset: number, limit: number): Promise<NoteList> {
    return {
      items: await this.repository.getNoteListByCreatorId(id, offset, limit),
    };
  }
}
