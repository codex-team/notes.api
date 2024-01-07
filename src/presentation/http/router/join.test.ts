import { describe, test, expect } from 'vitest';

describe('Join API', () => {
  describe('POST /join/:hash', () => {
    test('Returns 406 when user is already in the team', async () => {
      const expectedStatus = 406;
      const hash = 'Hzh2hy4igf';
      const userId = 2;
      const accessToken = global.auth(userId);

      const expectedResponse = {
        message: 'Team with user specified user and note already exists',
      };

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
      expect(await response?.json()).toStrictEqual(expectedResponse);
    });
    test('Returns 406 when invitation hash is not valid', async () => {
      const expectedStatus = 406;
      const hash = 'Jih23y4igf';
      const userId = 4;
      const accessToken = global.auth(userId);

      const expectedResponse = {
        message: `Note with invitation ${hash} does not exists`,
      };

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
      expect(await response?.json()).toStrictEqual(expectedResponse);
    });
    test('Returns 200 when user is added to the team', async () => {
      const userId = 1;
      const noteId = 1;
      const expectedResponse = {
        result: {
          id: 2,
          noteId,
          userId,
          role: 0,
        },
      };
      const expectedStatus = 200;
      const hash = 'Hzh2hy4igf';
      const accessToken = global.auth(userId);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
      expect(await response?.json()).toStrictEqual(expectedResponse);
    });
  });
});
