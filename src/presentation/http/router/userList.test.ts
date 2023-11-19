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
        pageNumber: 1,
        expectedUserList: [ {
          'id': 1,
          'email': 'a@a.com',
          'name': 'Test user 1',
          'createdAt': '2023-10-16T13:49:19.000Z',
          'photo': '',
          'editorTools': null,
        },
        {
          'id': 4,
          'email': 'Egoramurin@gmail.com',
          'name': 'Егор Амурин',
          'createdAt': '2023-10-22T16:19:40.892Z',
          'photo': 'https://lh3.googleusercontent.com/a/ACg8ocL9_uBaC7XMFhosJZfIkDLC8tTm1GhtbvDfSbjf9eI2=s96-c',
          'editorTools': null,
        },
        {
          'id': 5,
          'email': 'eliza@gmail.com',
          'name': 'Алиса Марикова',
          'createdAt': '2023-11-11T20:23:40.892Z',
          'photo': '',
          'editorTools': null,
        } ] },

      { portionSize: 0,
        pageNumber : 2,
        expectedUserList: [] },
    ])
    ('Returns a userList with specified lengths with status 200', async ({ portionSize, pageNumber, expectedUserList }) => {
      const expectedStatus = 200;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/users?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const usersList = response?.json().items;

      expect(usersList).toHaveLength(portionSize);

      expect(usersList).toStrictEqual(expectedUserList);
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