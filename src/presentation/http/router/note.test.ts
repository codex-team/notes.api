
import { describe, test, expect } from 'vitest';
import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notes-settings.json';
import noteTeams from '@tests/test-data/note-teams.json';

describe('Note API', () => {
  describe('GET note/resolve-hostname/:hostname ', () => {
    test('Returns note with specified hostname', async () => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/resolve-hostname/codex.so',
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        note: {
          id: 'TJmEb89e0l',
          content: {},
        },
        accessRights: {
          canEdit: false,
        },
      });
    });

    test('Returns 404 when note not found', async () => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: '/note/resolve-hostname/incorrect_hostname',
      });

      expect(response?.statusCode).toBe(404);

      expect(response?.json()).toStrictEqual({ message: 'Note not found' });
    });
  });

  describe('GET note/:notePublicId ', () => {
    test('Returns note by public id with 200 status when note is publicly available', async () => {
      const correctID = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${correctID}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual({
        note: {
          id: 'Pq1T9vc23Q',
          content: {},
        },
        accessRights: {
          canEdit: false,
        },
      });
    });

    test('Returns note by public id with 200 status when access is disabled, but user is creator', async () => {
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

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual({
        note: {
          id: '73NdxFZ4k7',
          content: {},
        },
        accessRights: {
          canEdit: true,
        },
      });
    });

    test('Returns note and parent note by note public id with 200 status', async () => {
      const correctID = 'f43NU75weU';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${correctID}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual({
        note: {
          id: 'f43NU75weU',
          content: {},
        },
        parentNote: {
          id: 'Hu8Gsm0sA1',
          content: {},
        },
        accessRights: {
          canEdit: false,
        },
      });
    });

    test('Returns 403 when the note is not public, the user is not authorized', async () => {
      const notPublicNote = notes.find(newNote => {
        const settings = noteSettings.find(ns => ns.note_id === newNote.id);

        return settings!.is_public === false;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${notPublicNote!.public_id}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });

    test('Returns 403 when public access is disabled, user is not creator of the note and is not in the team', async () => {
      const userId = 2;
      const accessToken = global.auth(userId);

      const notPublicNote = notes.find(newNote => {
        const settings = noteSettings.find(ns => ns.note_id === newNote.id);
        const team = noteTeams.find(nt => nt.note_id === newNote.id && nt.user_id === userId);

        return settings!.is_public === false && newNote.creator_id !== userId && team === undefined;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${notPublicNote!.public_id}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });

    test('Returns 404 when the id  does not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${nonexistentId}`,
      });

      expect(response?.statusCode).toBe(404);

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
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${id}`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    describe('Access rights', () => {
      test('Returns canEdit=false flag, when user is not authorized', async () => {
        const publicId = 'Pq1T9vc23Q';

        const response = await global.api?.fakeRequest({
          method: 'GET',
          url: `/note/${publicId}`,
        });

        expect(response?.statusCode).toBe(200);

        expect(response?.json().accessRights).toStrictEqual({ canEdit: false });
      });

      test('Returns canEdit=false when user is authorized, but is not the creator', async () => {
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

        expect(response?.statusCode).toBe(200);

        expect(response?.json().accessRights).toStrictEqual({ canEdit: false });
      });

      test('Returns canEdit=true, when user is authorized and is the creator of the note', async () => {
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

        expect(response?.statusCode).toBe(200);

        expect(response?.json().accessRights).toStrictEqual({ canEdit: true });
      });
    });
  });
});