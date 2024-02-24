import { describe, test, expect, beforeEach } from 'vitest';

describe('NoteList API', () => {
  beforeEach(async () => {
    /**
     * Truncate all tables, which are needed
     * Restart autoincrement sequences for data to start with id 1
     *
     * TODO get rid of restarting database data in tests (move to beforeEach)
     */
    await global.db.truncateTables();
  });

  describe('GET /notes?page', () => {
    test('Returns noteList with specified length (not for last page)', async () => {
      const portionSize = 30;
      const pageNumber = 1;

      /** Create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** Authorize user */
      const accessToken = global.auth(user.id);

      /** Create test notes */
      for (let i = 0; i < 49; i++) {
        await global.db.insertNote({
          creatorId: user.id,
          publicId: 'TJmEb89e0l',
        });
      }

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body.items).toHaveLength(portionSize);
    });

    test('Returns noteList with specified length (for last page)', async () => {
      const portionSize = 19;
      const pageNumber = 2;

      /** Create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** Authorize user */
      const accessToken = global.auth(user.id);

      /** Create test notes */
      for (let i = 0; i < 49; i++) {
        await global.db.insertNote({
          creatorId: user.id,
          publicId: 'TJmEb89e0l',
        });
      }

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body.items).toHaveLength(portionSize);
    });

    test('Returns noteList with no items if it has no notes', async () => {
      const pageNumber = 3;

      /** Create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** Authorize user */
      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(200);

      const body = response?.json();

      expect(body).toEqual( { items : [] } );
      expect(body.items).toHaveLength(0);
    });

    test('Returns 400 when page < 0', async () => {
      const pageNumber = 0;

      /** Create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** Authorize user */
      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(400);
    });

    test.only('Returns 400 when page is too large (maximum page number is 30 by default)', async () => {
      const pageNumber = 31;

      /** Create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** Authorize user */
      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(400);
    });
  });
});
