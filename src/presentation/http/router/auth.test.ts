import { describe, test, expect } from 'vitest';

describe('Auth API', () => {
  describe('POST /auth', () => {
    test('Returns 401 when session is not valid', async () => {
      const expectedStatus = 401;
      const refreshToken = 'not-validToken';
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth', // write not authorized data
        body: { token: refreshToken },
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual({ message: 'Session is not valid' });
    });

    test('Returns 200 when session was authorized', async () => {
      const expectedStatus = 200;

      // Define the token to include in the request body
      const refreshToken = 'pv-jIqfPj1';

      const expectedAuthReply = {
        refreshToken: expect.any(String),
        accessToken: expect.any(String),
      };

      // Include the token in the request body
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth', // write authorized data
        body: { token: refreshToken }, // Include the token in the request body
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toMatchObject(expectedAuthReply);
    });
  });
});
