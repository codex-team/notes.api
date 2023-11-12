import userSessions from '@tests/test-data/user-sessions.json';
import { describe, test, expect, beforeAll } from 'vitest';


/**
 * Access token that will be used for Auhorization header
 */
let accessToken = '';

describe('UserList API', () => {
  beforeAll(() => {
    /**
     * userId for authorization
     */
    const userId = userSessions[0]['user_id'];

    accessToken = global.auth(userId);
  });

  describe('GET /users?page', () => {
    test.each([
      { portionSize : 3,
        pageNumber: 1 },

      { portionSize: 0,
        pageNumber : 2 },
    ])
    ('Returns a userList with specified lengths with status 200', async ({ portionSize, pageNumber }) => {
      const expectedStatus = 200;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/users?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.json();

      expect(body.items).toHaveLength(portionSize);
    });

    test.each([
      { pageNumber : 0 },

      { pageNumber : 31 },
    ])
    ('Returns a status of 400 when the page number goes beyond the set values', async ({ pageNumber }) => {
      const expectedStatus = 400;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/users?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
    });
  });
});