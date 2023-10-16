
import { describe, test, expect } from 'vitest';

describe('Notes API', () => {
  describe('Get note by custom hostname', () => {
    test('GET note/resolve-hostname/:hostname returns note of correct structure', async () => {
      const expectedStatus = 200;
      /* eslint-disable @typescript-eslint/naming-convention */
      const expectedNote = {
        'id': 1,
        'publicId': 'note_1',
        'creatorId': 1,
        'content': null,
        'createdAt': '2023-10-16T13:49:19.000Z',
        'updatedAt': '2023-10-16T13:49:19.000Z',
        'notes_settings':  {
          'custom_hostname': 'note_hostname',
          'enabled': true,
          'id': 1,
          'note_id': 1,
        },
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      const response = await global.api?.server?.inject({
        method: 'GET',
        url: '/note/resolve-hostname/note_hostname',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual(expectedNote);
    });

    test('GET note/resolve-hostname/:hostname returns 404 when note not found', async () => {
      const expectedStatus = 404;

      const response = await global.api?.server?.inject({
        method: 'GET',
        url: '/note/resolve-hostname/incorrect_hostname',
      });

      expect(response?.statusCode).toBe(expectedStatus);

      const body = response?.body !== undefined ? JSON.parse(response?.body) : {};

      expect(body).toStrictEqual({ message: 'Note not found' });
    });
  });
});
