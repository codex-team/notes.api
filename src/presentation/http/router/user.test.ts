import { describe, test, expect } from 'vitest';


describe('user API', () => {
  describe('GET /user/myself', () => {
    test('returns user with status code 200 if user exists', async () => {
      const expectedStatus = 200;
      const userId = 1;
      const accessToken = global.auth(userId);
      const expectedUser =   {
        'id': '1',
        'email': 'a@a.com',
        'name': 'Test user 1',
        'photo': '',
      };
      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: '/user/myself',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.json();

      expect(body).toStrictEqual(expectedUser);
    });
    test('returns you must be authorized response if user is not authorized', async () => {
      const expextedResponse = 'You must be authenticated to access this resource';
      const expectedStatus = 401;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/user/myself',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.json();

      expect(body.message).toStrictEqual(expextedResponse);
    });
  });
});