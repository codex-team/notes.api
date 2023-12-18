import { describe, test, expect } from 'vitest';

import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notes-settings.json';

describe('Note API', () => {


  describe('POST /note', () => {

    test('Post a new note without parentId passed', async () => {
      const expectedStatus = 200;
      const userId = 2;
      const accessToken = global.auth(userId);

      /** POST fakeRequest sends back a NotePublicId typeof string */
      const post_response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note`,
        body: {},
      });

      expect(post_response?.statusCode).toBe(expectedStatus);
      expect(post_response?.json().id).toBeTypeOf('string');
      expect(post_response?.json().id.length).toBeGreaterThan(0);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      const expectedStatus = 401;

      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: `/note`,
        body: {},
      });

      expect(response?.statusCode).toBe(expectedStatus);
      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });


    test.todo('Returns 400 when parentId has incorrect characters and lenght');
  });

  test.todo('API should not return internal id and "publicId".  It should return only "id" which is public id.');
});
