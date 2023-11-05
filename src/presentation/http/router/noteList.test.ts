// import type AuthSession from '@domain/entities/authSession';
import userSessions from '@tests/test-data/userSessions.json';
import { describe, test, expect, beforeAll } from 'vitest';

let accessToken = '';
/**
 * Util for authorization
 *
 * @param refreshToken - refresh token. There should be a user session with this refresh token in database
 * @todo Move this function to tests/utils
 */
//
// async function authorize(refreshToken: string): Promise<string> {
// const response = await global.api?.fakeRequest({
//     method: 'POST',
//     url: '/auth',
//     headers: {
//       // eslint-disable-next-line @typescript-eslint/naming-convention
//       'Content-Type': 'application/json',
//     },
//     body : JSON.stringify({ token : refreshToken }),
// });
//
// const body: AuthSession = response?.body !== undefined ? JSON.parse(response?.body) : {};
//
// return body.accessToken;
// }
//

describe('NoteList API', () => {
  beforeAll(async () => {
    /**
     * Authorize using refresh token and POST /auth
     */
    const id = userSessions[0]['user_id'];

    /**
     * Access token that will be used for Auhorization header
     */
    accessToken = global.auth(id);
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

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body.items).toHaveLength(portionSize);
    });

    test('Returns noteList with specified lenght (for last page)', async () => {
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

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

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

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toEqual( { items : [] } );
      expect(body.items).toHaveLength(0);
    });

    test('Returns 400 when page < 0', async () => {
      const expextedStatus = 400;
      const pageNumber = 0;


      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expextedStatus);
    });

    test('Returns 400 when page is too large', async () => {
      const expextedStatus = 400;
      const pageNumber = 31;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(expextedStatus);
    });
  });
});
