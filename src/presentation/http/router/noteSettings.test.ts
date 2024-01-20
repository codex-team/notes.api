import { describe, test, expect } from 'vitest';

import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notes-settings.json';

describe('NoteSettings API', () => {
  describe('GET /note-settings/:notePublicId ', () => {
    test('Returns note settings by public id with 200 status', async () => {
      const expectedStatus = 200;
      const existingNotePublicId = 'Pq1T9vc23Q';

      const expectedNoteSettings = {
        'customHostname': 'codex.so',
        'isPublic': true,
        'id': 2,
        'noteId': 2,
        'invitationHash': 'E2zRXv3cp-',
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${existingNotePublicId}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(expectedNoteSettings);
    });
  });

  test('Returns 404 when note settings with specified note public id do not exist', async () => {
    const expectedStatus = 404;
    const nonexistentId = 'ishvm5qH84';

    const response = await global.api?.fakeRequest({
      method: 'GET',
      url: `/note-settings/${nonexistentId}`,
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
      expectedMessage: '\'/note-settings/+=*&*5%&&^&-\' is not a valid url component' },
  ])
  ('Returns 400 when public id of the note settings has incorrect characters and length', async ({ id, expectedMessage }) => {
    const expectedStatus = 400;

    const response = await global.api?.fakeRequest({
      method: 'GET',
      url: `/note-settings/${id}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json().message).toStrictEqual(expectedMessage);
  });

  test('Returns 403 when the note is not public, the user is not authorized', async () => {
    const expectedStatus = 403;

    const notPublicNote = notes.find(newNote => {
      const settings = noteSettings.find(ns => ns.note_id === newNote.id);

      return settings!.is_public === false;
    });

    const response = await global.api?.fakeRequest({
      method: 'GET',
      url: `/note-settings/${notPublicNote!.public_id}`,
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
      url: `/note-settings/${notPublicNote!.public_id}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
  });

  describe('GET /note-settings/:notePublicId/team ', () => {
    test('Returns team by public id with 200 status, user is creator of the note', async () => {
      const expectedStatus = 200;
      const userId = 2;
      const accessToken = global.auth(userId);

      const userNote = notes.find(newNote => {
        return newNote.creator_id === userId;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${userNote!.public_id}/team`,
      });

      expect(response?.statusCode).toBe(expectedStatus);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      const expectedStatus = 401;
      const correctID = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${correctID}/team`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });

    test('Returns status 404 when the public id does not exist', async () => {
      const expectedStatus = 404;
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${nonexistentId}/team`,
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
        expectedMessage: '\'/note-settings/+=*&*5%&&^&-/team\' is not a valid url component' },
    ])
    ('Returns 400 when public id of the note settings has incorrect characters and length', async ({ id, expectedMessage }) => {
      const expectedStatus = 400;

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${id}/team`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('We should to check team value in tests');

    test.todo('Returns team by public id with 200 status, user is not creator of the note, but a member of the team');

    test.todo('Returns 403 when user authorized, but not member of the team');
  });

  describe('PATCH /note-settings/:notePublicId ', () => {
    test('Update note settings by public id with 200 status, user is creator of the note', async () => {
      const expectedStatus = 200;
      const userId = 2;
      const accessToken = global.auth(userId);

      const userNote = notes.find(newNote => {
        return newNote.creator_id === userId;
      });

      const updatedNoteSettings = {
        'id': 53,
        'noteId': 53,
        'customHostname': 'codex.so',
        'isPublic': false,
        'invitationHash': 'FfAwyaR80C',
      };

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${userNote!.public_id}`,
        body: {
          'isPublic': false,
        },
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(updatedNoteSettings);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      const expectedStatus = 401;
      const correctID = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${correctID}`,
        body: {
          'isPublic': false,
        },
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });

    test('Returns status 406 when the public id does not exist', async () => {
      const expectedStatus = 406;
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${nonexistentId}`,
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
        expectedMessage: '\'/note-settings/+=*&*5%&&^&-\' is not a valid url component' },
    ])
    ('Returns 400 when public id of the note settings has incorrect characters and length', async ({ id, expectedMessage }) => {
      const expectedStatus = 400;

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${id}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('Return 200 when user in team and have Member Role = write');

    test.todo('Return 403 when user in team and have Member Role = read');

    test.todo('Return 403 when user authorized, but not member of the team');
  });

  describe('PATCH /note-settings/:notePublicId/team', () => {
    test('Update team member role by user id and note id, with status code 200', async () => {
      // patch member role of existing team member
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${global.auth(1)}`,
        },
        url: '/note-settings/Pq1T9vc23Q/team',
        body: {
          userId: 1,
          newRole: 1,
        },
      });

      expect(response?.statusCode).toBe(200);

      // check if we changed role correctly
      const team = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${global.auth(1)}`,
        },
        url: '/note-settings/Pq1T9vc23Q/team',
      });

      expect(team?.json()).toStrictEqual([
        {
          'id': 2,
          'noteId': 2,
          'userId': 1,
          'role': 1,
        },
      ]);
    });

    test('Returns status code 200 and new role, if role was patched (if the user already had passing a role, then behavior is the same)', async () => {
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${global.auth(1)}`,
        },
        url: '/note-settings/Pq1T9vc23Q/team',
        body: {
          userId: 1,
          newRole: 1,
        },
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.body).toBe('1');
    });

    test('Returns status code 404 and "User does not belong to Note\'s team" message if no such a note exists', async () => {
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${global.auth(1)}`,
        },
        url: '/note-settings/73NdxFZ4k7/team',
        body: {
          userId: 15,
          newRole: 1,
        },
      });

      expect(response?.statusCode).toBe(404);
      expect(response?.json().message).toBe('User does not belong to Note\'s team');
    });
  });
});
