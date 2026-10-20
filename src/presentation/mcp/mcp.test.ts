import { describe, test, expect, beforeEach } from 'vitest';
import type User from '@domain/entities/user.js';
import config from '@infrastructure/config/index.js';

/**
 * Web app url used in links to notes
 */
const webUrl = config.httpApi.mcp.webUrl;

/**
 * Creates MCP token for the user via API
 * @param user - user who will own the token
 * @param permission - what MCP client can do with notes of the user
 * @returns plain token
 */
async function createMcpToken(user: User, permission: 'read' | 'write'): Promise<string> {
  const response = await global.api?.fakeRequest({
    method: 'POST',
    headers: {
      authorization: `Bearer ${global.auth(user.id)}`,
    },
    url: '/user/mcp-tokens',
    body: {
      label: 'Test client',
      permission,
    },
  });

  return response!.json<{ token: string }>().token;
}

/**
 * Sends JSON-RPC request to the MCP endpoint
 * @param token - authorization token
 * @param method - JSON-RPC method
 * @param params - JSON-RPC params
 */
async function sendMcpRequest(token: string | undefined, method: string, params: object = {}): ReturnType<NonNullable<typeof global.api>['fakeRequest']> {
  return await global.api?.fakeRequest({
    method: 'POST',
    url: '/mcp',
    headers: {
      ...(token !== undefined ? { authorization: `Bearer ${token}` } : {}),
      accept: 'application/json, text/event-stream',
    },
    body: {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    },
  });
}

/**
 * Parsed JSON of the tool result. Its shape depends on the tool, so tests access it freely
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type ToolResultData = any;

/**
 * Calls MCP tool and returns its result
 * @param token - MCP token
 * @param name - name of the MCP tool to call
 * @param args - tool arguments
 * @returns error flag and text of the tool result, parsed as JSON when possible
 */
async function callTool(token: string, name: string, args: object): Promise<{ isError: boolean; text: string; data: ToolResultData }> {
  const response = await sendMcpRequest(token, 'tools/call', {
    name,
    arguments: args,
  });

  const { result } = response!.json<{ result: { isError?: boolean; content: { text: string }[] } }>();
  const text = result.content[0].text;
  let data: ToolResultData = null;

  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  return {
    isError: result.isError === true,
    text,
    data,
  };
}

/**
 * Builds paragraph block
 * @param text - paragraph content with inline HTML
 */
function paragraph(text: string): object {
  return {
    type: 'paragraph',
    data: { text },
  };
}

describe('MCP API', () => {
  beforeEach(async () => {
    await global.db.truncateTables();
  });

  describe('Authorization', () => {
    test('Returns 401 without token', async () => {
      const response = await sendMcpRequest(undefined, 'tools/list');

      expect(response?.statusCode).toBe(401);
    });

    test('Returns 401 for unknown MCP token', async () => {
      const response = await sendMcpRequest('ntx_unknownunknownunknownunknownun', 'tools/list');

      expect(response?.statusCode).toBe(401);
    });

    test('Returns 401 for access token', async () => {
      const user = await global.db.insertUser();

      const response = await sendMcpRequest(global.auth(user.id), 'tools/list');

      expect(response?.statusCode).toBe(401);
    });

    test('Returns 401 for revoked token', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'read');

      await global.db.query('DELETE FROM public.mcp_tokens');

      const response = await sendMcpRequest(token, 'tools/list');

      expect(response?.statusCode).toBe(401);
    });

    test('MCP token is not accepted by other API routes', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'write');

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: '/user/myself',
      });

      expect(response?.statusCode).toBe(401);
    });

    test('Returns 405 for GET', async () => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/mcp',
      });

      expect(response?.statusCode).toBe(405);
    });
  });

  describe('Server', () => {
    test('Responds to initialize', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'read');

      const response = await sendMcpRequest(token, 'initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: {
          name: 'test',
          version: '1.0.0',
        },
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.json().result.serverInfo.name).toBe('notex');
    });

    test.each([
      {
        permission: 'read' as const,
        expectedTools: ['get_note', 'list_notes'],
      },
      {
        permission: 'write' as const,
        expectedTools: ['create_note', 'get_note', 'list_notes', 'update_note'],
      },
    ])('Lists tools available for $permission token', async ({ permission, expectedTools }) => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, permission);

      const response = await sendMcpRequest(token, 'tools/list');

      const toolNames = response?.json().result.tools.map((tool: { name: string }) => tool.name).sort();

      expect(toolNames).toStrictEqual(expectedTools);
    });

    test('Read token can not call write tools', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'read');

      const result = await callTool(token, 'create_note', {
        blocks: [paragraph('Hello')],
      });

      expect(result.isError).toBe(true);

      const [rows] = await global.db.query('SELECT id FROM public.notes') as [unknown[]];

      expect(rows).toHaveLength(0);
    });

    test('Counts tool calls of the token', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'read');

      await sendMcpRequest(token, 'tools/list');
      await callTool(token, 'list_notes', {});
      await callTool(token, 'list_notes', { source: 'created' });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${global.auth(user.id)}`,
        },
        url: '/user/mcp-tokens',
      });

      const [item] = response?.json().items;

      expect(item.requestCount).toBe(2);
      expect(item.lastUsedAt).not.toBeNull();
    });
  });

  describe('Tools', () => {
    test('Creates, reads, lists and updates notes', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'write');

      /**
       * Create root note and a note nested in it
       */
      const parent = await callTool(token, 'create_note', {
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Project <b>X</b>',
              level: 1,
            },
          },
        ],
      });

      expect(parent.isError).toBe(false);
      expect(parent.data.url).toBe(`${webUrl}/note/${parent.data.id}`);

      const child = await callTool(token, 'create_note', {
        blocks: [paragraph('Meeting notes'), paragraph('First item')],
        parent: parent.data.url,
      });

      expect(child.isError).toBe(false);

      /**
       * Get note by URL
       */
      const note = await callTool(token, 'get_note', {
        note: `${child.data.url}/settings`,
      });

      expect(note.data).toMatchObject({
        id: child.data.id,
        title: 'Meeting notes',
        canEdit: true,
        parents: [
          {
            id: parent.data.id,
            title: 'Project X',
          },
        ],
      });
      expect(note.data.content.blocks).toHaveLength(2);
      expect(note.data.content.blocks[0].id).toHaveLength(10);

      /**
       * List notes
       */
      const recent = await callTool(token, 'list_notes', {});

      expect(recent.data.items.map((item: { id: string }) => item.id).sort()).toStrictEqual([parent.data.id, child.data.id].sort());

      const tree = await callTool(token, 'list_notes', {
        parent: parent.data.id,
      });

      expect(tree.data).toMatchObject({
        id: parent.data.id,
        title: 'Project X',
        children: [
          {
            id: child.data.id,
            title: 'Meeting notes',
            children: [],
          },
        ],
      });

      /**
       * Append a list block, then replace the content keeping the first block
       */
      const appended = await callTool(token, 'update_note', {
        note: child.data.id,
        mode: 'append',
        blocks: [
          {
            type: 'list',
            data: {
              style: 'unordered',
              items: ['One', 'Two'],
            },
          },
        ],
        expectedUpdatedAt: note.data.updatedAt,
      });

      expect(appended.isError).toBe(false);

      let updated = await callTool(token, 'get_note', { note: child.data.id });

      expect(updated.data.content.blocks.map((block: { type: string }) => block.type)).toStrictEqual(['paragraph', 'paragraph', 'list']);

      const replaced = await callTool(token, 'update_note', {
        note: child.data.id,
        blocks: [updated.data.content.blocks[0], paragraph('Only item')],
      });

      expect(replaced.isError).toBe(false);

      updated = await callTool(token, 'get_note', { note: child.data.id });

      expect(updated.data.content.blocks).toMatchObject([
        { id: note.data.content.blocks[0].id },
        {
          type: 'paragraph',
          data: { text: 'Only item' },
        },
      ]);
    });

    test('Rejects update of the note changed after expectedUpdatedAt', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'write');

      const created = await callTool(token, 'create_note', {
        blocks: [paragraph('Draft')],
      });

      const result = await callTool(token, 'update_note', {
        note: created.data.id,
        blocks: [paragraph('Changed')],
        expectedUpdatedAt: '2020-01-01T00:00:00.000Z',
      });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('Note was changed');

      const note = await callTool(token, 'get_note', { note: created.data.id });

      expect(note.data.title).toBe('Draft');
    });

    test('Rejects unknown block types and lists available ones', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'write');

      const result = await callTool(token, 'create_note', {
        blocks: [
          {
            type: 'checklist',
            data: { items: [] },
          },
        ],
      });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('Unknown block types: checklist');
      expect(result.text).toContain('paragraph');
    });

    test('Does not update note the user can not edit', async () => {
      const owner = await global.db.insertUser();
      const user = await global.db.insertUser();
      const note = await global.db.insertNote({ creatorId: owner.id });

      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const token = await createMcpToken(user, 'write');

      const read = await callTool(token, 'get_note', { note: note.publicId });

      expect(read.isError).toBe(false);
      expect(read.data.canEdit).toBe(false);

      const result = await callTool(token, 'update_note', {
        note: note.publicId,
        blocks: [paragraph('Hacked')],
      });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('You can not edit this note');
    });

    test('Returns API error for private note of another user', async () => {
      const owner = await global.db.insertUser();
      const user = await global.db.insertUser();
      const note = await global.db.insertNote({ creatorId: owner.id });

      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      const token = await createMcpToken(user, 'read');

      const result = await callTool(token, 'get_note', { note: note.publicId });

      expect(result.isError).toBe(true);
    });

    test('Returns error for a reference that is not a note', async () => {
      const user = await global.db.insertUser();
      const token = await createMcpToken(user, 'read');

      const result = await callTool(token, 'get_note', { note: 'not a note' });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('is neither a note URL nor a note id');
    });
  });
});
