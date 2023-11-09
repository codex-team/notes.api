import { describe, test, expect } from 'vitest';

describe('NoteSettings API', () => {
  describe('GET note-settings/:notePublicId ', () => {
    test('Returns note settings by public id with 200 status', async () => {
      const expectedStatus = 200;
      const existedNotePublicId = 'Pq1T9vc23Q';

      const expectedNote = {
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

      expect(body).toStrictEqual(expectedNote);
    });
  });
});