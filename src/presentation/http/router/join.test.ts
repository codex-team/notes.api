import { describe, test, expect } from 'vitest';

describe('Join API', () => {
  describe('POST /join/:hash', () => {
    test('Returns 406 when user is already in the team', async () => {
      const expectedStatus = 406;
      const hash = 'Hzh2hy4igf';
      const userId = 2;
      const accessToken = global.auth(userId);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
      });

      expect(response?.statusCode).toBe(406);

      expect(await response?.json()).toStrictEqual({
        message: 'Team with user specified user and note already exists',
      });
    });
    test('Returns 406 when invitation hash is not valid', async () => {
      const hash = 'Jih23y4igf';
      const userId = 4;
      const accessToken = global.auth(userId);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
      });

      expect(response?.statusCode).toBe(406);

      expect(await response?.json()).toStrictEqual({
        message: `Note with invitation ${hash} does not exists`,
      });
    });

    test('Returns 200 when user is added to the team', async () => {
      const userId = 1;
      const noteId = 1;
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

      expect(response?.statusCode).toBe(200);

      expect(await response?.json()).toStrictEqual({
        result: {
          id: 2,
          noteId,
          userId,
          role: 0,
        },
      };);
    });
  });
});
