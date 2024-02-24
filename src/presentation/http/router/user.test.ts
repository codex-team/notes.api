import { describe, test, expect } from 'vitest';


describe('User API', () => {
  describe('GET /user/myself', () => {
    test('Returns user with status code 200 if user exists', async () => {
      const userId = 1;
      const accessToken = global.auth(userId);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: '/user/myself',
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body).toStrictEqual({
        'id': '1',
        'email': 'a@a.com',
        'name': 'Test user 1',
        'photo': '',
      });
    });

    test('Returns response with status 401 when user is not authorized', async () => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/user/myself',
      });

      expect(response?.statusCode).toBe(401);

      const body = response?.json();

      expect(body.message).toBe('You must be authenticated to access this resource');
    });
  });
  describe('POST /user/editor-tools', () => {
    test('Returns added tool with status code 200 if tool added to user extensions', async () => {
      await global.db.truncateTables();

      /**
       * Create user and get accessToken
       */
      const createdUser = await global.db.insertUser({
        email: 'test@gmail.com',
        name: 'Test',
      });
      const accessToken = global.auth(createdUser.id);

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
