import userSessions from '@test/test-data/userSessions.json';
import { describe, test, expect } from 'vitest';

const refresh_token = userSessions[0]['refresh_tocken'];
const access_token = await global.api?.fakeRequest({
  method: 'POST',
  url: `/auth/?token=${refresh_token}`,
});

describe('NoteList API', () => {
  describe('GET /notes?page', () => {
    test('Returns noteList with specified lenght (not for last page)', async () => {
      const expectedStatus = 200;
      const portionSize = 30;
      const pageNumber = 1;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: `/notes/&page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toHaveLength(portionSize);
    });

    test('Returns noteList with specified lenght (for last page)', async () => {
      const expectedStatus = 200;
      const portionSize = 20;
      const pageNumber = 2;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: `/notes/&page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toHaveLength(portionSize);
    });

    test('Returns noteList with no items if it has no notes', async () => {
      const expectedStatus = 200;
      const pageNumber = 3;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: `/notes/&page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toEqual([]);
      expect(body).toHaveLength(0);
    });

    test('Returns 400 when page < 0', async () => {
      const expextedStatus = 400;
      const pageNumber = 0;


      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: `/notes/&page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expextedStatus);
    });

    test('Returns 400 when page is too large', async () => {
      const expextedStatus = 400;
      const pageNumber = 31;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${access_token}`,
        },
        url: `/notes/&page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expextedStatus);
    });
  });
});