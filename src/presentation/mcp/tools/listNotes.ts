import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { NoteListPublic } from '@domain/entities/noteList.js';
import type { NoteHierarchy } from '@domain/entities/NoteHierarchy.js';
import type { NotePublicId } from '@domain/entities/note.js';
import type { McpToolContext } from '../types.js';
import { jsonResult } from '../types.js';
import { getNoteUrl, resolveNotePublicId } from '../noteRef.js';
import { getTitle, stripHtml } from '../content.js';

/**
 * Max page number supported by note list routes
 */
const MAX_PAGE = 30;

/**
 * Nested note returned by the tool
 */
interface NoteTreeItem {
  id: NotePublicId;
  title: string;
  url: string;
  children: NoteTreeItem[];
}

/**
 * Finds the note in the hierarchy
 * @param node - hierarchy node to search in
 * @param publicId - public id of the note to find
 */
function findHierarchyNode(node: NoteHierarchy, publicId: NotePublicId): NoteHierarchy | null {
  if (node.noteId === publicId) {
    return node;
  }

  for (const child of node.childNotes ?? []) {
    const found = findHierarchyNode(child, publicId);

    if (found !== null) {
      return found;
    }
  }

  return null;
}

/**
 * Converts hierarchy node to the tool result format
 * @param node - hierarchy node
 * @param webUrl - web app url
 */
function toTreeItem(node: NoteHierarchy, webUrl: string): NoteTreeItem {
  return {
    id: node.noteId,
    title: stripHtml(node.noteTitle),
    url: getNoteUrl(webUrl, node.noteId),
    children: (node.childNotes ?? []).map(child => toTreeItem(child, webUrl)),
  };
}

/**
 * Registers "list_notes" tool
 * @param server - MCP server
 * @param context - tool context
 */
export function registerListNotesTool(server: McpServer, context: McpToolContext): void {
  server.registerTool('list_notes', {
    title: 'List notes',
    description: 'Lists notes of the user. '
    + 'Without "parent" returns a page of 30 notes: recently opened ones ("recent") or the ones created by the user ("created"). '
    + 'With "parent" returns the tree of notes nested in the given note.',
    inputSchema: {
      source: z.enum(['recent', 'created']).default('recent')
        .describe('"recent" — notes ordered by the last visit, "created" — notes created by the user, newest first'),
      page: z.number().int()
        .min(1)
        .max(MAX_PAGE)
        .default(1)
        .describe('Page number, 30 notes per page'),
      parent: z.string().optional()
        .describe('URL or id of the note whose nested notes should be listed'),
    },
    annotations: {
      readOnlyHint: true,
    },
  }, async ({ source, page, parent }) => {
    await context.onToolCall();

    if (parent !== undefined) {
      const parentId = await resolveNotePublicId(parent, context.api, context.webUrl);
      const { noteHierarchy } = await context.api.get<{ noteHierarchy: NoteHierarchy | null }>(`/note/note-hierarchy/${parentId}`);
      const parentNode = noteHierarchy === null ? null : findHierarchyNode(noteHierarchy, parentId);

      if (parentNode === null) {
        return jsonResult({
          id: parentId,
          url: getNoteUrl(context.webUrl, parentId),
          children: [],
        });
      }

      return jsonResult(toTreeItem(parentNode, context.webUrl));
    }

    const route = source === 'created' ? '/notes/created' : '/notes';
    const { items } = await context.api.get<NoteListPublic>(`${route}?page=${page}`);

    return jsonResult({
      items: items.map(note => ({
        id: note.id,
        title: getTitle(note.content),
        url: getNoteUrl(context.webUrl, note.id),
        updatedAt: note.updatedAt,
      })),
    });
  });
}
