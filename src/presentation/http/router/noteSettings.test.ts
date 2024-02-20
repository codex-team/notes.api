import { describe, test, expect } from 'vitest';
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

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'a@a.com',
        name: 'Test user 1',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: true,
        invitationHash: 'Hzh2hy4igf',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${existingNotePublicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().team).toStrictEqual([
        {
          'id': 1,
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

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

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
      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'a@a.com',
        name: 'Test user 1',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: false,
        invitationHash: 'Hzh2hy4igf',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/Pq1T9vc23Q`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });

    test('Returns 403 when public access is disabled, user is not creator of the note and is not in the team', async () => {
      const userId = 2;
      const accessToken = global.auth(userId);

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'a@a.com',
        name: 'Test user 1',
      });

      /** create test user */
      await global.db.insertUser({
        email: 'b@b.com',
        name: 'Test user 2',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: false,
        invitationHash: 'Hzh2hy4igf',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/Pq1T9vc23Q`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });
  });

  describe('GET /note-settings/:notePublicId/team ', () => {
    test('Returns team by public id with 200 status, user is creator of the note', async () => {
      const userId = 1;
      const accessToken = global.auth(userId);

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'a@a.com',
        name: 'Test user 1',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: false,
        invitationHash: 'Hzh2hy4igf',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/Pq1T9vc23Q/team`,
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
      const userId = 1;
      const accessToken = global.auth(userId);

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'a@a.com',
        name: 'Test user 1',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: true,
        invitationHash: 'Hzh2hy4igf',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      const updatedNoteSettings = {
        'customHostname': 'null',
        'isPublic': false,
        'invitationHash': 'Hzh2hy4igf',
      };

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/Pq1T9vc23Q`,
        body: {
          'isPublic': false,
        },
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject(updatedNoteSettings);
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
      const userId = 1;
      const accessToken = global.auth(userId);

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'a@a.com',
        name: 'Test user 1',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: true,
        invitationHash: 'Hzh2hy4igf',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/Pq1T9vc23Q/invitation-hash`,
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
      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'testemal@CodeXmail.com',
        name: 'CodeX',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'Pq1T9vc23Q',
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

      /** patch member role of existing team member */
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

      /** check if we changed role correctly */
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
      /** in note_teams there already is this user with this role */
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
      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      await global.db.insertUser({
        email: 'testemal@CodeXmail.com',
        name: 'CodeX',
      });

      /** create test note for created user */
      await global.db.insertNote({
        creatorId: 1,
        publicId: '73NdxFZ4k7',
      });

      /** create test team member (userId 1) for created note */
      await global.db.insertNoteTeam({
        userId: 1,
        noteId: 1,
        role: 0,
      });

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

