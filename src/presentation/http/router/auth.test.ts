import { describe, test, expect } from 'vitest';

describe('Auth API', () => {
  describe('POST /auth', () => {
    test('Returns 401 when session is not valid', async () => {
      const expectedStatus = 401;
      const refreshToken = 'not-validToken';
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        body: { token: refreshToken },
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual({ message: 'Session is not valid' });
    });

    test('Returns 200 when session was authorized', async () => {
      const expectedStatus = 200;

      /** Define the token to include in the request body */
      const refreshToken = 'pv-jIqfPj1';

      const notEmptyString = expect.stringMatching('/^.$/');

      const expectedAuthReply = {
        refreshToken: notEmptyString,
        accessToken: notEmptyString,
      };


      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        body: { token: refreshToken }, /** Include the token in the request body*/
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toMatchObject(expectedAuthReply);
    });

    test('Returns 401 when expiration day has passed', async () => {
      const expectedStatus=401;
      const refreshToken = 'pv-jIqfPj1';
      /** Set the expiration day to a date in the past */
      const pastExpirationDay = new Date('Sat, 03 Nov 2022 16:53:36 GMT').toUTCString();

      const response=await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        headers:{ date:pastExpirationDay },
        body:{ token: refreshToken },
      });

      expect (response?.statusCode).toBe(expectedStatus);
      const body = response?.body !== undefined ? JSON.parse(response?.body):{};

      expect(body).toStrictEqual({ message:'Session is not valid' });
    });
  });
});
