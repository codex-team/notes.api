import { describe, test, expect } from 'vitest';

describe('Auth API', () => {
  describe('POST /auth', () => {
    test('Returns 401 when session is not valid', async () => {
      const expectedStatus = 401;
      const refreshToken = 'EF1JX65xSZ';
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        body: { token: refreshToken },
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = await response?.json();

      expect(body).toStrictEqual({ message: 'Session is not valid' });
    });

    test('Returns 200 when refreshToken is in the database', async () => {
      const expectedStatus = 200;

      /** Define the token to include in the request body */
      const missingToken = 'pv-jIqfPj1';

      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        /** Include the token in the request body*/
        body: { token: missingToken },
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = await response?.json();

      expect(typeof body.refreshToken).toBe('string');
      expect(typeof body.accessToken).toBe('string');

      // Optionally, you can also check if the strings are not empty or null
      expect(body.refreshToken).toBeDefined();
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).not.toBeNull();
      expect(body.accessToken).not.toBeNull();
      expect(body.refreshToken).not.toBe('');
      expect(body.accessToken).not.toBe('');

      // Check if the response object matches the expected structure
      expect(body).toHaveProperty('refreshToken');
      expect(body).toHaveProperty('accessToken');
    });


    test('Returns 401 when expiration day has passed', async () => {
      const expectedStatus = 401;
      const outdatedToken = 'F5tTF24K9Q';


      const response=await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',

        body:{ token: outdatedToken },
      });

      expect (response?.statusCode).toBe(expectedStatus);
      const body = await response?.json();

      expect(body).toStrictEqual({ message:'Session is not valid' });
    });
  });
});
