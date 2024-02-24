import { describe, test, expect } from 'vitest';

describe('Editor Tools', () => {
  describe('POST /editor-tools/add-tool', () => {
    test('Returns added tool with status code 200 if tool added to all tools', async () => {
      await global.db.truncateTables();

      const createdUser = await global.db.insertUser();

      const accessToken = global.auth(createdUser.id);

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

      expect(body.data).toMatchObject(toolToAdd);

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
  });
});
