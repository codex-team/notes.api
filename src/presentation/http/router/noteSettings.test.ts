import { describe, test, expect } from 'vitest';

import notes from '@tests/test-data/notes.json';
import noteSettings from '@tests/test-data/notes-settings.json';
import noteTeams from '@tests/test-data/note-teams.json';

describe('NoteSettings API', () => {
  describe('GET /note-settings/:notePublicId ', () => {
    test('Returns note settings by public id with 200 status', async () => {
      const existingNotePublicId = 'f43NU75weU';

      const expectedNoteSettings = {
        'customHostname': 'codex.so',
        'invitationHash': 'FfAwyaR80C',
        'isPublic': true,
        'team':  [],
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${existingNotePublicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual(expectedNoteSettings);
    });

    test('Returns team with note settings by public id with 200 status', async () => {
      const existingNotePublicId = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${existingNotePublicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().team).toStrictEqual([
        {
          'id': 2,
          'role': 0,
          'user': {
            'email': 'a@a.com',
            'id': 1,
            'name': 'Test user 1',
            'photo': '',
          },
        },
      ]);
    });

    test('Returns 404 when note settings with specified note public id do not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${nonexistentId}`,
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
        expectedMessage: '\'/note-settings/+=*&*5%&&^&-\' is not a valid url component' },
    ])
    ('Returns 400 when public id of the note settings has incorrect characters and length', async ({ id, expectedMessage }) => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${id}`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test('Returns 403 when the note is not public, the user is not authorized', async () => {
      const notPublicNote = notes.find(newNote => {
        const settings = noteSettings.find(ns => ns.note_id === newNote.id);

        return settings!.is_public === false;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${notPublicNote!.public_id}`,
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

        return settings!.is_public === false && newNote.creator_id != userId && team === undefined;
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${notPublicNote!.public_id}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });
  });

  describe('GET /note-settings/:notePublicId/team ', () => {
    test('Returns team by public id with 200 status, user is creator of the note', async () => {
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

      expect(response?.statusCode).toBe(200);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      const correctID = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${correctID}/team`,
      });

      expect(response?.statusCode).toBe(401);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });

    test('Returns status 404 when the public id does not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${nonexistentId}/team`,
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
        expectedMessage: '\'/note-settings/+=*&*5%&&^&-/team\' is not a valid url component' },
    ])
    ('Returns 400 when public id of the note settings has incorrect characters and length', async ({ id, expectedMessage }) => {
      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${id}/team`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('We should to check team value in tests');

    test.todo('Returns team by public id with 200 status, user is not creator of the note, but a member of the team');

    test.todo('Returns 403 when user authorized, but not member of the team');
  });

  describe('PATCH /note-settings/:notePublicId ', () => {
    test('Update note settings by public id with 200 status, user is creator of the note', async () => {
      const userId = 2;
      const accessToken = global.auth(userId);

      const userNote = notes.find(newNote => {
        return newNote.creator_id === userId;
      });

      const updatedNoteSettings = {
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

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual(updatedNoteSettings);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      const correctID = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${correctID}`,
        body: {
          'isPublic': false,
        },
      });

      expect(response?.statusCode).toBe(401);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });

    test('Returns status 406 when the public id does not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${nonexistentId}`,
      });

      expect(response?.statusCode).toBe(406);

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
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${id}`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('Return 200 when user in team and have Member Role = write');

    test.todo('Return 403 when user in team and have Member Role = read');

    test.todo('Return 403 when user authorized, but not member of the team');
  });

  describe('PATCH /note-settings/:notePublicId/invitation-hash ', () => {
    test('Returns status 401 when the user is not authorized', async () => {
      const correctID = 'Pq1T9vc23Q';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${correctID}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(401);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });

    test('Generate invitation hash by public id with 200 status, user is creator of the note', async () => {
      const userId = 2;
      const accessToken = global.auth(userId);

      const userNote = notes.find(newNote => {
        return newNote.creator_id === userId;
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${userNote!.public_id}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().invitationHash).not.toBe('');

      expect(response?.json().invitationHash).toHaveLength(10);
    });

    test('Returns status 406 when the public id does not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${nonexistentId}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(406);

      expect(response?.json()).toStrictEqual({ message: 'Note not found' });
    });

    test.each([
      { id: 'mVz3iHuez',
        expectedMessage: 'params/notePublicId must NOT have fewer than 10 characters' },

      { id: 'cR8eqF1mFf0',
        expectedMessage: 'params/notePublicId must NOT have more than 10 characters' },

      { id: '+=*&*5%&&^&-',
        expectedMessage: '\'/note-settings/+=*&*5%&&^&-/invitation-hash\' is not a valid url component' },
    ])
    ('Returns 400 when public id of the note has incorrect characters and length', async ({ id, expectedMessage }) => {
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${id}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);

      test.todo('Return 403 when user in team');
      test.todo('Return 403 when user authorized, but not member of the team and not the creator');
      test.todo('Return 200 when user is not creator of the note, but a member of the team with member role = write');
    });
  });

  describe('PATCH /note-settings/:notePublicId/team', () => {
    test('Update team member role by user id and note id, with status code 200', async () => {
      // create test user (id 1)
      await global.db.query(`INSERT INTO public.users ("email", "name", "created_at") VALUES ('testemal@CodeXmail.com', 'CodeX', CURRENT_DATE)`);

      // create test note (id 1) for test user
      await global.db.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "public_id") VALUES ('{}', 1, CURRENT_DATE, 'Pq1T9vc23Q')`);

      // create test team member (userId 1) for created note
      await global.db.query(`INSERT INTO public.note_teams ("user_id", "note_id", "role") VALUES (1, 1, 0)`);

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

      expect(team?.json()).toMatchObject([
        {
          'noteId': 1,
          'userId': 1,
          'role': 1,
        },
      ]);
    });

    test('Returns status code 200 and new role, if role was patched (if the user already had passing a role, then behavior is the same)', async () => {
      // in note_teams there already is this user with this role
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
      // create test user (id 1)
      await global.db.query(`INSERT INTO public.users ("email", "name", "created_at") VALUES ('testemal@CodeXmail.com', 'CodeX', CURRENT_DATE)`);

      // create test note (id 1) for test user
      await global.db.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "public_id") VALUES ('{}', 1, CURRENT_DATE, '73NdxFZ4k7')`);

      // create test team member (userId 1) for created note
      await global.db.query(`INSERT INTO public.note_teams ("user_id", "note_id", "role") VALUES (1, 1, 0)`);


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

    test.todo('Returns 200 and a new role, when patch is done by a member role = write');
    test.todo('Returns 200 when patch is done by a creator');
    test.todo('Returns 403 when patch is done by a member role = read');
    test.todo('Returns 403 when test is done by a user who is not a member of the team and not a creator');
  });
});

