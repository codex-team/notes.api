
import { describe, test, expect } from 'vitest';

import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notes-settings.json';

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
    test('Returns note by public id with 200 status', async () => {
      const expectedStatus = 200;
      
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
        url: '/note/Pq1T9vc23Q',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual(expectedNote);
    });

    test('Returns 403 when public access is disabled in the note settings', async () => {
      const expectedStatus = 403;

      const notPublicNote = notes.find(note => {
        const settings = noteSettings.find(ns => ns.note_id === note.id)
        if(settings != undefined)
        return settings.is_public === false
      })

      if(notPublicNote != undefined) {
        const response = await global.api?.fakeRequest({
          method: 'GET',
          url: `/note/${notPublicNote.public_id}`,
        });
  
        expect(response?.statusCode).toBe(expectedStatus);
  
        const body = response?.body !== undefined ? JSON.parse(response?.body) : {};
  
        expect(body).toStrictEqual({ message: 'Permission denied' });
      }
      
    });

    test('Returns 406 when the id contains incorrect characters', async () => {
      const expectedStatus = 406;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/PR0B_bmdSy',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual({ message: 'Note not found' });
    });

  });
}); 