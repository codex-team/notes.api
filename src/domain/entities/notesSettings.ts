/**
 * Notes settings entity
 */
export default class NotesSettings {
  /**
   * Just unique property identifier
   */
  id: number;

  /**
   * Related note id
   */
  noteId: number;

  /**
   * Custom hostname
   */
  customHostname: string;

  /**
   * Note entity constructor
   *
   * @param title - note title
   * @param content - note content
   * @param id - note id
   */
  constructor(customHostname: string, noteId: number, id = 0) {
    this.customHostname = customHostname;
    this.noteId = noteId;
    this.id = id;
  }
}
