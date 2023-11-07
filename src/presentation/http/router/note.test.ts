
import { describe, test, expect } from 'vitest';

import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notesSettings.json';

describe('Note API', () => {
  describe('GET note/resolve-hostname/:hostname ', () => {
    test('Returns note with specified hostname', async () => {
      const expectedStatus = 200;
      /* eslint-disable @typescript-eslint/naming-convention */
      const expectedNote = {
        'id': 1,
        'publicId': 'note_1',
        'creatorId': 1,
        'content': null,
        'createdAt': '2023-10-16T13:49:19.000Z',
        'updatedAt': '2023-10-16T13:49:19.000Z',
        'noteSettings':  {
          'customHostname': 'codex.so',
          'isPublic': true,
          'id': 1,
          'noteId': 1,
        },
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/resolve-hostname/codex.so',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual(expectedNote);
    });

    test('Returns 404 when note not found', async () => {
      const expectedStatus = 404;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/resolve-hostname/incorrect_hostname',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual({ message: 'Note not found' });
    });
  });

  describe('GET note/:notePublicId ', () => {
    test('Returns note by public id with 200 status when note is publicly available', async () => {
      const expectedStatus = 200;
      const correctID = 'Pq1T9vc23Q';

      const expectedNote = {
        'id': 2,
        'publicId': 'Pq1T9vc23Q',
        'creatorId': 1,
        'content': null,
        'createdAt': '2023-10-16T13:49:19.000Z',
        'updatedAt': '2023-10-16T13:49:19.000Z',
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${correctID}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(expectedNote);
    });

    test('Returns 403 when public access is disabled, user is not creator of the note', async () => {
      const expectedStatus = 403;

      const notPublicNote = notes.find(newNote => {
        const settings = noteSettings.find(ns => ns.note_id === newNote.id);

        return settings!.is_public === false;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${notPublicNote!.public_id}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });

    test('Returns 406 when the id  does not exist', async () => {
      const expectedStatus = 406;
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${nonexistentId}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual({ message: 'Note not found' });
    });

    test.each([
      { id: 'mVz3iHuez',
        expectedMessage: 'params/notePublicId must NOT have fewer than 10 characters' },

      { id: 'cR8eqF1mFf0',
        expectedMessage: 'params/notePublicId must NOT have more than 10 characters' },

      { id: '+=*&*5%&&^&-',
        expectedMessage: '\'/note/+=*&*5%&&^&-\' is not a valid url component' },
    ])
    ('Returns 400 when id has incorrect characters and length', async ({ id, expectedMessage }) => {
      const expectedStatus = 400;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${id}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('Returns note by public id with 200 status when access is disabled, but user is creator');

    test.todo('API should not return internal id and "publicId".  It should return only "id" which is public id.');
  });
});