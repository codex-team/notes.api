import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpTokenPermission } from '@domain/entities/mcpToken.js';
import type { McpToolContext } from './types.js';
import { registerListNotesTool } from './tools/listNotes.js';
import { registerGetNoteTool } from './tools/getNote.js';
import { registerCreateNoteTool } from './tools/createNote.js';
import { registerUpdateNoteTool } from './tools/updateNote.js';

/**
 * Instructions for MCP clients describing the server
 */
const INSTRUCTIONS = 'NoteX is a note-taking app built on Editor.js. '
  + 'Notes are referenced by URL (https://notex.so/note/<id>) or by 10-character id, and can be nested in other notes. '
  + 'Note content is stored as Editor.js blocks, the first block is the note title.';

/**
 * Creates MCP server with tools available for the token permission.
 * Tokens with "read" permission see only tools that do not change notes
 * @param context - tool context
 * @param permission - MCP token permission
 */
export function createMcpServer(context: McpToolContext, permission: McpTokenPermission): McpServer {
  const server = new McpServer({
    name: 'notex',
    version: '1.0.0',
  }, {
    instructions: INSTRUCTIONS,
  });

  registerListNotesTool(server, context);
  registerGetNoteTool(server, context);

  if (permission === 'write') {
    registerCreateNoteTool(server, context);
    registerUpdateNoteTool(server, context);
  }

  return server;
}
