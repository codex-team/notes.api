import type NoteRepository from '@repository/note.repository';
import type { NoteList } from '@domain/entities/noteList';

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
   * Gets note list by creator id
   *
   * @param id - note creator id
   * @returns { Promise<NoteList | null> } note
   */
  public async getNoteListByCreatorId(id: number): Promise<NoteList | null> {
    return await this.repository.getNoteListByCreatorId(id);
  }
}
