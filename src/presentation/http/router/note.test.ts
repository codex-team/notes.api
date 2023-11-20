
import { describe, test, expect } from 'vitest';

import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notes-settings.json';

describe('Note API', () => {
  describe('GET note/resolve-hostname/:hostname ', () => {
    test('Returns note with specified hostname', async () => {
      const expectedStatus = 200;
      const expectedResponse = {
        'note': {
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
        },
        'accessRights': {
          'canEdit': false,
        },
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/resolve-hostname/codex.so',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(expectedResponse);
    });

    test('Returns 404 when note not found', async () => {
      const expectedStatus = 404;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/resolve-hostname/incorrect_hostname',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual({ message: 'Note not found' });
    });
  });

  describe('GET note/:notePublicId ', () => {
    test('Returns note by public id with 200 status when note is publicly available', async () => {
      const expectedStatus = 200;
      const correctID = 'Pq1T9vc23Q';
      const expectedResponse = {
        'note': {
          'id': 2,
          'publicId': 'Pq1T9vc23Q',
          'creatorId': 1,
          'content': null,
          'createdAt': '2023-10-16T13:49:19.000Z',
          'updatedAt': '2023-10-16T13:49:19.000Z',
        },
        'accessRights': {
          'canEdit': false,
        },
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${correctID}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(expectedResponse);
    });

    test('Returns note by public id with 200 status when access is disabled, but user is creator', async () => {
      const expectedStatus = 200;
      const expectedResponse = {
        'note': {
          'id': 3,
          'publicId': '73NdxFZ4k7',
          'creatorId': 1,
          'content': null,
          'createdAt': '2023-10-16T13:49:19.000Z',
          'updatedAt': '2023-10-16T13:49:19.000Z',
        },
        'accessRights': {
          'canEdit': true,
        },
      };
      const userId = 1;
      const accessToken = global.auth(userId);

      const privateUserNote = notes.find(newNote => {
        const settings = noteSettings.find(ns => ns.note_id === newNote.id);

        return settings!.is_public === false && newNote.creator_id === userId;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${privateUserNote!.public_id}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(expectedResponse);
    });

    test('Returns 403 when the note is not public, the user is not authorized', async () => {
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

    test('Returns 403 when public access is disabled, user is not creator of the note', async () => {
      const expectedStatus = 403;
      const userId = 2;
      const accessToken = global.auth(userId);

      const notPublicNote = notes.find(newNote => {
        const settings = noteSettings.find(ns => ns.note_id === newNote.id);

        return settings!.is_public === false && newNote.creator_id != userId;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
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

    test.todo('API should not return internal id and "publicId".  It should return only "id" which is public id.');
  });
});

describe('Access rights', () => {
  test('Returns public note by public id with status 200 and with false canEdit flag, when user is not authorized', async () => {
    const expectedStatus = 200;
    const publicId = 'Pq1T9vc23Q';

    const response = await global.api?.fakeRequest({
      method: 'GET',
      url: `/note/${publicId}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json().accessRights).toStrictEqual({ canEdit: false });
  });

  test('Returns public note by public id with status 200 and with false canEdit flag, when user is authorized, but is not the creator of the note', async () => {
    const expectedStatus = 200;
    const publicId = 'Pq1T9vc23Q';
    const userId = 4;
    const accessToken = global.auth(userId);

    const response = await global.api?.fakeRequest({
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      url: `/note/${publicId}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json().accessRights).toStrictEqual({ canEdit: false });
  });

  test('Returns public note by public id with status 200 and with true canEdit flag, when user is authorized and is the creator of the note', async () => {
    const expectedStatus = 200;
    const publicId = 'Pq1T9vc23Q';
    const userId = 1;
    const accessToken = global.auth(userId);

    const response = await global.api?.fakeRequest({
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      url: `/note/${publicId}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json().accessRights).toStrictEqual({ canEdit: true });
  });
});
