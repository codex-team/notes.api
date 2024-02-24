import { describe, test, expect, beforeEach } from 'vitest';

let accessToken: string;
let userId: number;

describe('Editor Tools', () => {
  beforeEach(async () => {
    await global.db.truncateTables();

    const createdUser = await global.db.insertUser();

    userId = createdUser.id;
    accessToken = global.auth(userId);
  });
  describe('POST /editor-tools/add-tool', () => {
    test('Returns added tool with status code 200 if tool added to all tools', async () => {
      const toolToAdd = {
        name: 'code',
        title: 'Code Tool',
        exportName: 'Code',
        isDefault: false,
        source: {
          cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/code@latest',
        },
      };

      const addToolResponse = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: '/editor-tools/add-tool',
        body: toolToAdd,
      });

      expect(addToolResponse?.statusCode).toBe(200);

      const body = addToolResponse?.json();

      expect(body.data).toMatchObject({
        ...toolToAdd,
        userId,
      });

      /**
       * Check if tool was added to all tools
       */
      const getAllToolsResponse = await global.api?.fakeRequest({
        method: 'GET',
        url: '/editor-tools/all',
      });

      const allTools = getAllToolsResponse?.json();

      expect(allTools.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining(toolToAdd),
        ])
      );
    });
    test('Returns 400 if tool data is invalid', async () => {
      const toolDataWithoutName = {
        title: 'Code Tool',
        exportName: 'Code',
        isDefault: false,
        source: {
          cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/code@latest',
        },
      };

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: '/editor-tools/add-tool',
        body: toolDataWithoutName,
      });

      expect(response?.statusCode).toBe(400);
    });
  });
});
