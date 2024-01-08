import { describe, expect, test } from "vitest";

describe('Oauth API', () => {
  describe('GET /google/callback', () => {
    test('Returns a login user', async () => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/oauth/google/callback',
      });

      console.log(response?.statusCode);

      expect(response?.statusCode).toBe(200);
    });
  });
});
