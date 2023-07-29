/**
 * Notes settings entity
 */
export default interface NotesSettings {
  /**
   * User session id
   */
  id: number;

  /**
   * Note id
   */
  noteId: number;

  /**
   * Custom hostname
   */
  customHostname: string;
}
