import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { Note } from '@domain/entities/note.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type { McpToolContext } from '../types.js';
import { jsonResult } from '../types.js';
import { getNoteUrl, resolveNotePublicId } from '../noteRef.js';
import { BLOCKS_FORMAT_DESCRIPTION, blockInputSchema, fillBlockIds, getToolsForBlocks } from '../content.js';
import type { GetNoteResponse } from './getNote.js';
import { NotexApiError } from '../notexApi.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Registers "update_note" tool
 * @param server - MCP server
 * @param context - tool context
 */
export function registerUpdateNoteTool(server: McpServer, context: McpToolContext): void {
  server.registerTool('update_note', {
    title: 'Update note',
    description: 'Updates note content. '
    + '"replace" mode replaces all blocks of the note with the passed ones, so pass the whole content: get it with get_note first. '
    + '"append" mode adds the passed blocks to the end of the note.\n\n' + BLOCKS_FORMAT_DESCRIPTION,
    inputSchema: z.object({
      note: z.string().describe('Note URL (e.g. https://notex.so/note/<id>) or note id'),
      blocks: z.array(blockInputSchema).describe('Blocks to replace the content with or to append'),
      mode: z.enum(['replace', 'append']).default('replace')
        .describe('"replace" — replace all blocks, "append" — add blocks to the end'),
      expectedUpdatedAt: z.string().optional()
        .describe('"updatedAt" returned by get_note. If the note was changed after that, the update is rejected'),
    }),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
    },
  }, async ({ note: noteRef, blocks, mode, expectedUpdatedAt }) => {
    await context.onToolCall();

    const publicId = await resolveNotePublicId(noteRef, context.api, context.webUrl);
    const { note, accessRights, tools: noteTools } = await context.api.get<GetNoteResponse>(`/note/${publicId}`);

    if (!accessRights.canEdit) {
      throw new Error('You can not edit this note');
    }

    if (expectedUpdatedAt !== undefined && Date.parse(expectedUpdatedAt) !== Date.parse(note.updatedAt)) {
      throw new Error(`Note was changed at ${note.updatedAt}, after ${expectedUpdatedAt}. Get the note again and repeat the update`);
    }

    const newBlocks = fillBlockIds(blocks);
    const contentBlocks = mode === 'append' ? [...note.content.blocks, ...newBlocks] : newBlocks;
    const { data: userTools } = await context.api.get<{ data: EditorTool[] }>('/user/editor-tools');

    let updatedAt: Note['updatedAt'];

    try {
      ({ updatedAt } = await context.api.patch<{ updatedAt: Note['updatedAt'] }>(`/note/${publicId}`, {
        content: {
          blocks: contentBlocks,
        },
        tools: getToolsForBlocks(contentBlocks, [...noteTools, ...userTools]),

        /**
         * Content is built from the version read above, so the update must not overwrite newer changes
         */
        expectedUpdatedAt: note.updatedAt,
      }));
    } catch (error) {
      if (error instanceof NotexApiError && error.statusCode === Number(StatusCodes.CONFLICT)) {
        throw new Error('Note was changed by someone else during the update. Get the note again and repeat the update');
      }

      throw error;
    }

    return jsonResult({
      id: publicId,
      url: getNoteUrl(context.webUrl, publicId),
      updatedAt,
    });
  });
}
