import { describe, test, expect, beforeAll } from 'vitest';
import userSessions from '@tests/test-data/user-sessions.json';

/**
 * Access token that will be used for Auhorization header
 */
let accessToken = '';

describe('User editor tools', () => {
  beforeAll(() => {
    /**
     * userId for authorization
     */
    const userId = userSessions[0]['user_id'];

    accessToken = global.auth(userId);
  });
  describe('POST /user/editor-tools', () => {
    test('Returns editor tools with status code 200 if tool added', async () => {
      await global.db.truncateTables();

      const addedToolId = await global.db.insertEditorTool({
        name: 'code',
        title: 'Code Tool',
        exportName: 'Code',
        isDefault: false,
        source: {
          cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/code@latest',
        },
      });

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: '/user/editor-tools',
        body: {
          'toolId': addedToolId,
        },
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body).toStrictEqual({
        addedTool :{
          id: addedToolId,
          name: 'code',
          title: 'Code Tool',
          exportName: 'Code',
          isDefault: false,
          source: {
            cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/code@latest',
          },
        },
      });
    });
  });
});
