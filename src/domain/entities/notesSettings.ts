import type { PublicId } from '@domain/entities/publicId.js';

/**
 * Notes settings entity
 */
export default interface NotesSettings {
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
  customHostname?: string;

  /**
   * Public id to get note via link, not by integer identifier, but by string hash
   */
  publicId: PublicId;

  /**
   * Is note public for everyone or only for collaborators
   */
  enabled: boolean;
}
