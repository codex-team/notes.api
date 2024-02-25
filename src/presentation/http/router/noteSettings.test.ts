import { describe, test, expect, beforeEach } from 'vitest';
import { MemberRole } from '@domain/entities/team.js';
describe('NoteSettings API', () => {
  describe('GET /note-settings/:notePublicId ', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Returns note settings by public id with 200 status', async () => {
      const notePublicId = 'f43NU75weU';

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: user.id,
        publicId: 'f43NU75weU',
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        customHostname: 'codex.so',
        invitationHash: 'FfAwyaR80C',
        isPublic: true,
      });

      const expectedNoteSettings = {
        'customHostname': 'codex.so',
        'invitationHash': 'FfAwyaR80C',
        'isPublic': true,
        'team':  [],
      };

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${notePublicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual(expectedNoteSettings);
    });

    test('Returns "team" along with the note settings if the note contains a team', async () => {
      /** create test user */
      const creator = await global.db.insertUser();

      const randomTeamMember = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: randomTeamMember.id,
        noteId: note.id,
        role: MemberRole.Read,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().team).toStrictEqual([
        {
          'id': 1,
          'role': MemberRole.Read,
          'user': {
            'email': randomTeamMember.email,
            'id': randomTeamMember.id,
            'name': randomTeamMember.name,
            'photo': '',
          },
        },
      ]);
    });

    test('Returns 200 and team by public id, user is not creator of the note, but a member of the team with Write role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'kwjsuI2UYT',
        creatorId: creator.id,
      });

      /** Create test note team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Write,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.json()).toMatchObject([ {
        noteId: note.id,
        role: MemberRole.Write,
        userId: teamMember.id,
      } ]);
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
      /** create test user */
      const user = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });

    test('Returns 403 when public access is disabled, user is not creator of the note', async () => {
      /** create test user */
      const creator = await global.db.insertUser();

      /** create test user */
      const randomGuy = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create note settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      const accessToken = global.auth(randomGuy.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });
  });

  describe('GET /note-settings/:notePublicId/team ', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Returns the team if user is a creator of the note', async () => {
      /** create test user */
      const creator = await global.db.insertUser();

      const randomTeamMember = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      /** create test team member for created note */
      await global.db.insertNoteTeam({
        userId: randomTeamMember.id,
        noteId: note.id,
        role: MemberRole.Read,
      });

      const accessToken = global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject([ {
        noteId: note.id,
        role: MemberRole.Read,
        userId: randomTeamMember.id,
      } ]);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      await global.db.truncateTables();

      const user = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note-settings/${note.publicId}/team`,
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

    test('Returns 403 when user is authorized, but is not member of the team and not creator', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'jdkfuw8201',
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(403);
    });
  });

  describe('PATCH /note-settings/:notePublicId ', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Update note settings by public id with 200 status, user is creator of the note', async () => {
      /** create test user */
      const user = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      /** create test note settings for created note */
      const noteSettings = await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}`,
        body: {
          'isPublic': false,
        },
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        'isPublic': false,
        'invitationHash': noteSettings.invitationHash,
      });
    });

    test('Returns 200 when user is in team and has a Write role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'jdkfuw8201',
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Write,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      await global.db.truncateTables();

      const user = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${note.publicId}`,
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

    test('Returns 403 when user is in team and has a Read role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'ppp1238201',
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Read,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);
    });

    test('Return 403 when user authorized, but not member of the team', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'jdJJJw90oW',
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);
    });
  });

  describe('PATCH /note-settings/:notePublicId/invitation-hash ', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Returns status 401 when the user is not authorized', async () => {
      await global.db.truncateTables();

      const user = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note-settings/${note.publicId}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(401);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
    });

    test('Generate the new invitation hash if user is a creator of the note', async () => {
      /** create test user */
      const creator = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create test note settings for created note */
      const noteSettings = await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const accessToken = global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().invitationHash).not.toBe('');

      expect(response?.json().invitationHash).toHaveLength(10);

      /** chech if invitation hash is different than the previous */
      expect(response?.json().invitationHash).not.toBe(noteSettings.invitationHash);
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
    });

    test('Returns 200 when user is not the creator, but in team with Write role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'KKKjuw8IIo',
        creatorId: creator.id,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Write,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);
    });

    test('Returns 403 when user is not in team', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'JDKfuiKLwo',
        creatorId: creator.id,
      });

      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);
    });

    test('Returns 403 when user is in team with Read role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'lllKmdjsu&',
        creatorId: creator.id,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Read,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);
    });
  });

  describe('PATCH /note-settings/:notePublicId/team', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Update team member role by user id and note id, with status code 200', async () => {
      /** create test user */
      const creator = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      const randomTeamMember = await global.db.insertUser({
        email: 'randomGuy@CodeXmail.com',
        name: 'Guy',
      });

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      await global.db.insertNoteTeam({
        userId: randomTeamMember.id,
        noteId: note.id,
        role: MemberRole.Read,
      });

      const accessToken = await global.auth(creator.id);

      /** patch member role of existing team member */
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: randomTeamMember.id,
          newRole: MemberRole.Write,
        },
      });

      expect(response?.statusCode).toBe(200);

      /** check if we changed role correctly */
      const team = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(team?.json()).toMatchObject([
        {
          'noteId': note.id,
          'userId': randomTeamMember.id,
          'role': 1,
        },
      ]);
    });

    test('Returns status code 200 and new role, if role was patched (if the user already had passing a role, then behavior is the same)', async () => {
      /** create test user */
      const creator = await global.db.insertUser({
        email: 'test@codexmail.com',
        name: 'CodeX',
      });

      const randomTeamMember = await global.db.insertUser({
        email: 'randomGuy@CodeXmail.com',
        name: 'Guy',
      });

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      await global.db.insertNoteTeam({
        userId: randomTeamMember.id,
        noteId: note.id,
        role: MemberRole.Write,
      });

      const accessToken = await global.auth(creator.id);

      /** in note_teams there already is this user with this role */
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: randomTeamMember.id,
          newRole: MemberRole.Write,
        },
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.body).toBe('1');
    });

    test('Returns status code 404 and "User does not belong to Note\'s team" message if no such a note exists', async () => {
      /** create test user */
      const user = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      const accessToken = await global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: 15,
          newRole: MemberRole.Write,
        },
      });

      expect(response?.statusCode).toBe(404);
      expect(response?.json().message).toBe('User does not belong to Note\'s team');
    });

    test('Returns 200 and a new role, when patch is done by a member with a Write role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test user whose team role will be changed */
      const teamMember2 = await global.db.insertUser({
        email: 'test3@codexmail.com',
        name: 'testUser3',
      });

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'jlpDosiw98',
        creatorId: creator.id,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Write,
      });

      /** Create another test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember2.id,
        role: MemberRole.Read,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'userId': teamMember2.id,
          'newRole': MemberRole.Write,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.body).toBe(MemberRole.Write.toString());
    });

    test('Returns 200 when patch is done by a creator', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'jkdopl9802',
        creatorId: creator.id,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Write,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'userId': teamMember.id,
          'newRole': MemberRole.Read,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(200);
      expect(response?.body).toBe(MemberRole.Read.toString());
    });

    test('Returns 403 when patch is done by member with a Read role', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create test user whose team role will be changed */
      const teamMember2 = await global.db.insertUser({
        email: 'test3@codexmail.com',
        name: 'testUser3',
      });

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: 'jdkKKKoq92',
        creatorId: creator.id,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Read,
      });

      /** Create another test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember2.id,
        role: MemberRole.Read,
      });

      const accessToken = global.auth(teamMember.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'userId': teamMember2.id,
          'newRole': MemberRole.Write,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(403);
    });

    test('Returns 403 when patch is done by a user who is not a member of the team', async () => {
      /** Create test user */
      const creator = await global.db.insertUser();

      /** Create another test user */
      const teamMember = await global.db.insertUser();

      /** Create another test user */
      const user = await global.db.insertUser({
        email: 'test3@codexmail.com',
        name: 'testUser3',
      });

      /** Create test note */
      const note = await global.db.insertNote({
        publicId: '000UI29381',
        creatorId: creator.id,
      });

      /** Create test team */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: teamMember.id,
        role: MemberRole.Read,
      });

      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'userId': teamMember.id,
          'newRole': MemberRole.Write,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(403);
    });
  });
});

