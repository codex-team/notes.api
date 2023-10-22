import { describe, test, expect } from 'vitest';
import userSessions from 'tests/test-data/userSessions.json';

const refresh_token = userSessions[0]['refresh_tocken'];
const access_token = await global.api?.fakeRequest({
  method: 'POST',
  url: `/auth/?token=${refresh_token}`,
});

describe('NoteList API', () => {
  describe('GET notes?page', () => {
    test('Returns noteList with specified lenght (not for last page)', async () => {
      const expectedStatus = 200;
      const portionSize = 30;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: '/notes/&page=1',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toHaveLength(portionSize);
    });

    test('Returns noteList with specified lenght (for last page)', async () => {
      const expectedStatus = 200;
      const portionSize = 20;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: '/notes/&page=2',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toHaveLength(portionSize);
    });

    test('Returns noteList with no items if page*portionSize > numberOfNotes', async () => {
      const expectedStatus = 200;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: '/notes/&page=3',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toEqual([]);
      expect(body).toHaveLength(0);
    });

    test('Returns 400 when page < 0', async () => {
      const expextedStatus = 400;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: '/notes/&page=0',
      });

      expect(response?.statusCode).toBe(expextedStatus);
    });

    test('Returns 400 when page > 0', async () => {
      const expextedStatus = 400;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: '/notes/&page=31',
      });

      expect(response?.statusCode).toBe(expextedStatus);
    });
  });
});