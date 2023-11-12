import { describe, test, expect } from 'vitest';

describe('NoteSettings API', () => {
  describe('GET note-settings/:notePublicId ', () => {
    test('Returns note settings by public id with 200 status', async () => {
      const expectedStatus = 200;
      const existedNotePublicId = 'Pq1T9vc23Q';

      const expectedNoteSettings = {
        'customHostname': 'codex.so',
        'isPublic': true,
        'id': 2,
        'noteId': 2,
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${existedNotePublicId}`,
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual(expectedNoteSettings);
    });
  });

  test('Returns 406 when the id  does not exist', async () => {
    const expectedStatus = 406;
    const nonexistentId = 'ishvm5qH84';

    const response = await global.api?.fakeRequest({
      method: 'GET',
      url: `/note-settings/${nonexistentId}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json()).toStrictEqual({ message: 'Note not found' });
  });

  test('Returns 400 when an id has invalid characters', async () => {
    const expectedStatus = 400;
    const invalidId = '+=*&*5%&&^&-';

    const response = await global.api?.fakeRequest({
      method: 'GET',
      url: `/note-settings/${invalidId}`,
    });

    expect(response?.statusCode).toBe(expectedStatus);

    expect(response?.json().message).toStrictEqual('\'/note-settings/+=*&*5%&&^&-\' is not a valid url component');
  });

  test.todo('Returns 400 when an id has incorrect length');

  test.todo('Returns 403 when public access is disabled, user is not creator of the note');
});