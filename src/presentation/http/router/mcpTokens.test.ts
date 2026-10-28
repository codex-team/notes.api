import { createHash } from 'crypto';
import { describe, test, expect, beforeEach } from 'vitest';
import type User from '@domain/entities/user.js';

/**
 * Creates MCP token for the user via API
 * @param user - user who will own the token
 * @param permission - what MCP client can do with notes of the user
 * @param label - text shown in user settings
 */
async function createToken(user: User, permission: 'read' | 'write' = 'read', label = 'Claude Code'): Promise<{ token: string; item: Record<string, unknown> }> {
  const response = await global.api?.fakeRequest({
    method: 'POST',
    headers: {
      authorization: `Bearer ${global.auth(user.id)}`,
    },
    url: '/user/mcp-tokens',
    body: {
      label,
      permission,
    },
  });

  return response!.json();
}

describe('MCP tokens API', () => {
  beforeEach(async () => {
    await global.db.truncateTables();
  });

  describe('POST /user/mcp-tokens', () => {
    test('Returns created token once and stores only its hash', async () => {
      const user = await global.db.insertUser();

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${global.auth(user.id)}`,
        },
        url: '/user/mcp-tokens',
        body: {
          label: 'Claude Code on laptop',
          permission: 'write',
        },
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body.token).toMatch(/^ntx_[\w-]{32}$/);
      expect(body.item).toMatchObject({
        preview: body.token.slice(-4),
        permission: 'write',
        label: 'Claude Code on laptop',
        lastUsedAt: null,
        requestCount: 0,
      });
      expect(body.item).not.toHaveProperty('tokenHash');
      expect(body.item).not.toHaveProperty('userId');

      const [rows] = await global.db.query(`SELECT token_hash AS "tokenHash" FROM public.mcp_tokens WHERE id = ${body.item.id}`) as [{ tokenHash: string }[]];
      const expectedHash = createHash('sha256')
        .update(body.token as string)
        .digest('hex');

      expect(rows[0].tokenHash).toBe(expectedHash);
    });

    test.each([
      {
        body: {
          label: 'Claude Code',
          permission: 'admin',
        },
      },
      {
        body: {
          label: '',
          permission: 'read',
        },
      },
      {
        body: {
          permission: 'read',
        },
      },
    ])('Returns 400 when body is invalid: $body', async ({ body }) => {
      const user = await global.db.insertUser();

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${global.auth(user.id)}`,
        },
        url: '/user/mcp-tokens',
        body,
      });

      expect(response?.statusCode).toBe(400);
    });

    test('Returns 401 when user is not authorized', async () => {
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/user/mcp-tokens',
        body: {
          label: 'Claude Code',
          permission: 'read',
        },
      });

      expect(response?.statusCode).toBe(401);
    });
  });

  describe('GET /user/mcp-tokens', () => {
    test('Returns only tokens of the current user without secrets', async () => {
      const user = await global.db.insertUser();
      const anotherUser = await global.db.insertUser();

      await createToken(user, 'read', 'First');
      await createToken(user, 'write', 'Second');
      await createToken(anotherUser, 'write', 'Foreign');

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${global.auth(user.id)}`,
        },
        url: '/user/mcp-tokens',
      });

      expect(response?.statusCode).toBe(200);

      const { items } = response?.json();

      expect(items.map((item: { label: string }) => item.label)).toStrictEqual(['Second', 'First']);

      for (const item of items) {
        expect(item).not.toHaveProperty('token');
        expect(item).not.toHaveProperty('tokenHash');
        expect(item).not.toHaveProperty('userId');
      }
    });

    test('Returns 401 when user is not authorized', async () => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/user/mcp-tokens',
      });

      expect(response?.statusCode).toBe(401);
    });
  });

  describe('DELETE /user/mcp-tokens/:tokenId', () => {
    test('Revokes token of the current user', async () => {
      const user = await global.db.insertUser();
      const { item } = await createToken(user);

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${global.auth(user.id)}`,
        },
        url: `/user/mcp-tokens/${item.id}`,
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.json()).toStrictEqual({ isDeleted: true });

      const [rows] = await global.db.query(`SELECT id FROM public.mcp_tokens WHERE id = ${item.id}`) as [unknown[]];

      expect(rows).toHaveLength(0);
    });

    test('Returns 404 and keeps the token when user tries to revoke token of another user', async () => {
      const owner = await global.db.insertUser();
      const anotherUser = await global.db.insertUser();
      const { item } = await createToken(owner);

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${global.auth(anotherUser.id)}`,
        },
        url: `/user/mcp-tokens/${item.id}`,
      });

      expect(response?.statusCode).toBe(404);

      const [rows] = await global.db.query(`SELECT id FROM public.mcp_tokens WHERE id = ${item.id}`) as [unknown[]];

      expect(rows).toHaveLength(1);
    });

    test('Returns 401 when user is not authorized', async () => {
      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        url: '/user/mcp-tokens/1',
      });

      expect(response?.statusCode).toBe(401);
    });
  });
});
