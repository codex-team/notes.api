import { describe, test, expect } from 'vitest';

describe('User list API', () => {
  describe('GET users ', () => {
    test('Returns list of users by pages', async () => {
      const expectedStatus = 200;

      const response = await global.api?.fakeRequest({
        headers: {
          authorization: `Bearer ${global.auth(1)}`,
        },
        method: 'GET',
        url: '/users/?page=1',
      });

      expect(response?.statusCode).toBe(expectedStatus);
    });
  });
});
