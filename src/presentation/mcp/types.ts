import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type NotexApi from './notexApi.js';

/**
 * Everything MCP tools need to handle a call
 */
export interface McpToolContext {
  /**
   * NoteX API client acting on behalf of the MCP token owner
   */
  api: NotexApi;

  /**
   * Web app url, used to build links to notes
   */
  webUrl: string;

  /**
   * Called on every tool call, used to track MCP token usage
   */
  onToolCall: () => Promise<void>;
}

/**
 * Wraps tool result to the MCP tool response
 * @param data - tool result, serialized as JSON text
 */
export function jsonResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
