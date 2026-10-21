import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { NotePublicId } from '@domain/entities/note.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type { McpToolContext } from '../types.js';
import { jsonResult } from '../types.js';
import { getNoteUrl, resolveNotePublicId } from '../noteRef.js';
import { BLOCKS_FORMAT_DESCRIPTION, blockInputSchema, fillBlockIds, getToolsForBlocks } from '../content.js';

/**
 * Registers "create_note" tool
 * @param server - MCP server
 * @param context - tool context
 */
export function registerCreateNoteTool(server: McpServer, context: McpToolContext): void {
  server.registerTool('create_note', {
    title: 'Create note',
    description: 'Creates a new note at the root or inside the parent note.\n\n' + BLOCKS_FORMAT_DESCRIPTION,
    inputSchema: {
      blocks: z.array(blockInputSchema).describe('Note content blocks'),
      parent: z.string().optional()
        .describe('URL or id of the parent note. Omit to create the note at the root'),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
    },
  }, async ({ blocks, parent }) => {
    await context.onToolCall();

    const parentId = parent === undefined ? undefined : await resolveNotePublicId(parent, context.api, context.webUrl);
    const contentBlocks = fillBlockIds(blocks);
    const { data: userTools } = await context.api.get<{ data: EditorTool[] }>('/user/editor-tools');

    const { id } = await context.api.post<{ id: NotePublicId }>('/note', {
      content: {
        blocks: contentBlocks,
      },
      parentId,
      tools: getToolsForBlocks(contentBlocks, userTools),
    });

    return jsonResult({
      id,
      url: getNoteUrl(context.webUrl, id),
    });
  });
}
