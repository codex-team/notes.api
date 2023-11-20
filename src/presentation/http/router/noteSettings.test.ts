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
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${existingNotePublicId}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      expect(response?.json()).toStrictEqual(expectedNoteSettings);
    });
  });

  test('Returns 406 when note settings with specified note public id do not exist', async () => {
    const expectedStatus = 406;
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
});