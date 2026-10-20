import type { NotePublicId } from '@domain/entities/note.js';
import type { NotePublic } from '@domain/entities/notePublic.js';
import type NotexApi from './notexApi.js';

/**
 * Note public id is a 10 characters nanoid
 */
const NOTE_PUBLIC_ID_PATTERN = /^[\w-]{10}$/;

/**
 * Note page path in the web app, e.g. /note/<id>, /note/<id>/settings, /note/<id>/history
 */
const NOTE_PATH_PATTERN = /^\/note\/([\w-]{10})(?:\/|$)/;

/**
 * Parses string as URL, scheme is optional
 * @param value - string to parse
 * @returns parsed URL or null if string is not a URL
 */
function parseUrl(value: string): URL | null {
  try {
    return new URL(/^https?:\/\//.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

/**
 * Builds link to the note page in the web app
 * @param webUrl - web app url
 * @param publicId - note public id
 */
export function getNoteUrl(webUrl: string, publicId: NotePublicId): string {
  return new URL(`/note/${publicId}`, webUrl).toString();
}

/**
 * Gets note public id from the note reference passed by MCP client.
 * Reference can be a note id, a link to the note in the web app or a link to the note published on a custom hostname
 * @param ref - note id or URL
 * @param api - NoteX API client
 * @param webUrl - web app url
 */
export async function resolveNotePublicId(ref: string, api: NotexApi, webUrl: string): Promise<NotePublicId> {
  const value = ref.trim();

  if (NOTE_PUBLIC_ID_PATTERN.test(value)) {
    return value;
  }

  const url = parseUrl(value);

  if (url === null) {
    throw new Error(`"${ref}" is neither a note URL nor a note id`);
  }

  const match = NOTE_PATH_PATTERN.exec(url.pathname);

  if (match !== null) {
    return match[1];
  }

  /**
   * Note can be published on a custom hostname
   */
  if (url.hostname !== new URL(webUrl).hostname) {
    const { note } = await api.get<{ note: NotePublic }>(`/note/resolve-hostname/${encodeURIComponent(url.hostname)}`);

    return note.id;
  }

  throw new Error(`Can not find note id in "${ref}"`);
}
