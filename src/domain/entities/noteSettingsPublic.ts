/**
 * Notes settings entity
 */
export default interface NoteSettingsPublic {
  /**
   * Custom hostname
   */
  customHostname?: string ;

  /**
   * Is note public for everyone or only for collaborators
   */
  isPublic: boolean;
}
