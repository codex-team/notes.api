import NoteRepository from '@repository/note.js';
import NoteService from '@domain/service/note.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService,
}

/**
 * Initiate services
 */
export function init(): DomainServices {
  /**
   * TODO - Pass existing storage instance
   */
  const noteRepository = new NoteRepository({});
  const noteService = new NoteService(noteRepository);

  return {
    noteService,
  };
}
