import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { NotePublic } from '@domain/entities/notePublic.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type { McpToolContext } from '../types.js';
import { jsonResult } from '../types.js';
import { getNoteUrl, resolveNotePublicId } from '../noteRef.js';
import { getTitle } from '../content.js';

/**
 * Response of the GET /note/:notePublicId route
 */
export interface GetNoteResponse {
  note: NotePublic;
  accessRights: {
    canEdit: boolean;
  };
  tools: EditorTool[];
  parents: NotePublic[];
}

/**
 * Registers "get_note" tool
 * @param server - MCP server
 * @param context - tool context
 */
export function registerGetNoteTool(server: McpServer, context: McpToolContext): void {
  server.registerTool('get_note', {
    title: 'Get note',
    description: 'Returns the note with its content in Editor.js format, parent notes and edit rights. '
    + 'Pass "updatedAt" from the result to update_note as "expectedUpdatedAt" to avoid overwriting newer changes.',
    inputSchema: z.object({
      note: z.string().describe('Note URL (e.g. https://notex.so/note/<id>) or note id'),
    }),
    annotations: {
      readOnlyHint: true,
    },
  }, async ({ note: noteRef }) => {
    await context.onToolCall();

    const publicId = await resolveNotePublicId(noteRef, context.api, context.webUrl);
    const { note, accessRights, parents } = await context.api.get<GetNoteResponse>(`/note/${publicId}`);

    return jsonResult({
      id: note.id,
      url: getNoteUrl(context.webUrl, note.id),
      title: getTitle(note.content),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      canEdit: accessRights.canEdit,
      parents: parents.map(parent => ({
        id: parent.id,
        title: getTitle(parent.content),
        url: getNoteUrl(context.webUrl, parent.id),
      })),
      content: note.content,
    });
  });
}
