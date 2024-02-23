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
    test('Returns editor tools with status code 200 if user exists', async () => {
      const userId = 1;
      const accessToken = global.auth(userId);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: '/user/editor-tools',
        body: {
          'toolId': '4',
        }
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body).toStrictEqual({
        addedTool: {
          id: '4',
          name: 'markdown',
          title: 'Markdown',
          exportName: 'Markdown',
          isDefault: false,
          source: {},
        },
      });
    });
  });
});
