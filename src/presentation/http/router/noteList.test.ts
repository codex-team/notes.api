<<<<<<< HEAD
import userSessions from '@tests/test-data/user-sessions.json';
=======
// import type AuthSession from '@domain/entities/authSession';
import userSessions from '@tests/test-data/userSessions.json';
>>>>>>> 023a509cd58ac661142c392596df8e9a10c65342
import { describe, test, expect, beforeAll } from 'vitest';

/**
 * Access token that will be used for Authorization header
 */
let accessToken = '';

<<<<<<< HEAD
=======

>>>>>>> 023a509cd58ac661142c392596df8e9a10c65342
describe('NoteList API', () => {
  beforeAll(() => {
    /**
     * userId for authorization
     */
<<<<<<< HEAD
    const userId = userSessions[0]['user_id'];

    accessToken = global.auth(userId);
=======
    const id = userSessions[0]['user_id'];

    accessToken = global.auth(id);
>>>>>>> 023a509cd58ac661142c392596df8e9a10c65342
  });

  describe('GET /notes?page', () => {
    test('Returns noteList with specified length (not for last page)', async () => {
      const expectedStatus = 200;
      const portionSize = 30;
      const pageNumber = 1;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.json();

      expect(body.items).toHaveLength(portionSize);
    });

    test('Returns noteList with specified length (for last page)', async () => {
      const expectedStatus = 200;
      const portionSize = 19;
      const pageNumber = 2;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.json();

      expect(body.items).toHaveLength(portionSize);
    });

    test('Returns noteList with no items if it has no notes', async () => {
      const expectedStatus = 200;
      const pageNumber = 3;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.json();

      expect(body).toEqual( { items : [] } );
      expect(body.items).toHaveLength(0);
    });

    test('Returns 400 when page < 0', async () => {
      const expectedStatus = 400;
      const pageNumber = 0;


      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
    });

    test('Returns 400 when page is too large (maximum page number is 30 by default)', async () => {
      const expectedStatus = 400;
      const pageNumber = 31;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
    });
  });
});
