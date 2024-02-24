import { describe, test, expect } from 'vitest';

describe('NoteList API', () => {
  describe('GET /notes?page', () => {
    test('Returns noteList with specified length (not for last page)', async () => {
      const portionSize = 30;
      const pageNumber = 1;

      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** create test notes for created user */
      for (let i = 0; i < portionSize; i++) {
        await global.db.insertNote({
          creatorId: user.id,
          publicId: 'TJmEb89e0l',
        });
      }

      const newAccessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${newAccessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().items).toHaveLength(portionSize);
    });

    test('Returns noteList with specified length (for last page)', async () => {
      const portionSize = 19;
      const pageNumber = 2;

      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      /** create test notes for created user */
      for (let i = 0; i < 30 + portionSize; i++) {
        await global.db.insertNote({
          creatorId: user.id,
          publicId: 'TJmEb89e0l',
        });
      }

      const newAccessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${newAccessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().items).toHaveLength(portionSize);
    });

    test('Returns noteList with no items if it has no notes', async () => {
      const pageNumber = 3;

      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      const newAccessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${newAccessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toEqual( { items : [] } );
      expect(response?.json().items).toHaveLength(0);
    });

    test('Returns 400 when page < 0', async () => {
      const pageNumber = 0;

      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      const newAccessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${newAccessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(400);
    });

    test('Returns 400 when page is too large (maximum page numbrer is 30 by default)', async () => {
      const pageNumber = 31;

      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const user = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      const newAccessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${newAccessToken}`,
        },
        url: `/notes?page=${pageNumber}`,
      });

      expect(response?.statusCode).toBe(400);
    });
  });
});
