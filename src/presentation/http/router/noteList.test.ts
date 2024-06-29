import { describe, test, expect, beforeEach } from 'vitest';

beforeEach(async () => {
  /**
   * Truncate all tables, which are needed
   * Restart autoincrement sequences for data to start with id 1
   * @todo get rid of restarting database data in tests (move to beforeEach)
   */
  await global.db.truncateTables();
});
describe('GET /notes?page', () => {
  test.each([
    /**
     * Returns noteList with specified length (not for last page)
     * User is authorized, notes are visited
     */
    {
      isAuthorized: true,
      expectedStatusCode: 200,
      notesVisited: true,
      expectedMessage: null,
      expectedLength: 30,
      pageNumber: 1,
    },
    /**
     * Returns noteList with specified length (for last page)
     * User is authorized, notes are visited
     */
    {
      isAuthorized: true,
      expectedStatusCode: 200,
      notesVisited: true,
      expectedMessage: null,
      expectedLength: 19,
      pageNumber: 2,
    },
    /**
     * Returns noteList with no items if there are no notes for certain page
     * User is authorized, notes are visited
     */
    {
      isAuthorized: true,
      expectedStatusCode: 200,
      notesVisited: true,
      expectedMessage: null,
      expectedLength: 0,
      pageNumber: 3,
    },
    /**
     * Returns 'querystring/page must be >= 1' message when page < 0
     */
    {
      isAuthorized: true,
      expectedStatusCode: 400,
      notesVisited: true,
      expectedMessage: 'querystring/page must be >= 1',
      expectedLength: 0,
      pageNumber: -1,
    },
    /**
     * Returns 'querystring/page must be <= 30' message when page is too large (maximum page numbrer is 30 by default)
     */
    {
      isAuthorized: true,
      expectedStatusCode: 400,
      notesVisited: true,
      expectedMessage: 'querystring/page must be <= 30',
      expectedLength: 0,
      pageNumber: 31,
    },
    /**
     * Returns 'unauthorized' message when user is not authorized
     */
    {
      isAuthorized: false,
      expectedStatusCode: 401,
      notesVisited: true,
      expectedMessage: 'You must be authenticated to access this resource',
      expectedLength: 0,
      pageNumber: 1,
    },
    /**
     * Returns noteList with no items if user did not visit any notes
     * User is authorized, notes are not visited
     */
    {
      isAuthorized: true,
      expectedStatusCode: 200,
      notesVisited: false,
      expectedMessage: null,
      expectedLength: 0,
      pageNumber: 1,
    },
  ])('Get note list', async ({ isAuthorized, expectedStatusCode, notesVisited, expectedMessage, expectedLength, pageNumber }) => {
    const portionSize = 49;
    let accessToken;

    /** Insert creator and randomGuy */
    const creator = await global.db.insertUser();

    const randomGuy = await global.db.insertUser();

    if (isAuthorized) {
      accessToken = global.auth(randomGuy.id);
    }

    for (let i = 0; i < portionSize; i++) {
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      if (notesVisited) {
        await global.db.insertNoteVisit({
          userId: randomGuy.id,
          noteId: note.id,
        });
      }
    }

    const response = await global.api?.fakeRequest({
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      url: `/notes?page=${pageNumber}`,
    });

    const body = response?.json();

    if (expectedMessage !== null) {
      expect(response?.statusCode).toBe(expectedStatusCode);

      expect(body.message).toBe(expectedMessage);
    } else {
      expect(response?.statusCode).toBe(expectedStatusCode);

      expect(body.items).toHaveLength(expectedLength);
    }
  });
});
