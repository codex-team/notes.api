import { describe, test, expect, beforeEach } from 'vitest';
import { MemberRole } from '@domain/entities/team.js';

describe('NoteSettings API', () => {
  beforeEach(async () => {
    /**
     * truncate all tables, which are needed
     * restart autoincrement sequences for data to start with id 1
     *
     * TODO get rid of restarting database data in tests (move to beforeEach)
     */
    await global.db.truncateTables();
  });
  describe('GET /note-settings/:notePublicId ', () => {
    test.each([
      /** Returns 401 when the user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
        expectedMessage: 'You must be authenticated to access this resource',
      },

      /** Returns 200 if user is a team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 when user is a team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 403 when user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },
    ])
    ('Get note settings and team by public id', async ({ role, isAuthorized, expectedStatusCode, expectedMessage }) => {
      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test note settings */
      const noteSettings = await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      /** Create test team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: note.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, the access token is empty */
      let accessToken = '';

      if (isAuthorized) {
        accessToken = global.auth(user.id);
      }

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.json()).toMatchObject(
          {
            isPublic: false,
            invitationHash: noteSettings.invitationHash,
            team:
              [
                {
                  role: MemberRole.Write,
                  user: {
                    id: creator.id,
                  },
                },

                {
                  role: role,
                  user: {
                    id: user.id,
                  },
                },
              ],

          }
        );
      } else {
        expect(response?.json()).toStrictEqual(
          {
            message: expectedMessage,
          });
      }
    });

    test('GET note settings by public id if user is in team of the 2nd parent note (other teams are contain only creator)', async () => {
      /** create two users */
      const creator = await global.db.insertUser();

      const randomGuy = await global.db.insertUser();

      /** create three notes */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const parentNote1 = await global.db.insertNote({
        creatorId: creator.id,
      });

      const parentNote2 = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create noteSettings for the note */
      const noteSettings = await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      /** create note relations */
      await global.db.insertNoteRelation({
        noteId: note.id,
        parentId: parentNote1.id,
      });

      await global.db.insertNoteRelation({
        noteId: parentNote1.id,
        parentId: parentNote2.id,
      });

      /** specify team for root note */
      await global.db.insertNoteTeam({
        noteId: parentNote2.id,
        userId: randomGuy.id,
        role: MemberRole.Write,
      });

      const accessToken = await global.auth(randomGuy.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        invitationHash: noteSettings.invitationHash,
        isPublic: noteSettings.isPublic,
      });
    });

    test('Returns status code 403 and message : \'Permission denied\'', async () => {
      /** create three users */
      const creator = await global.db.insertUser();

      const randomGuy = await global.db.insertUser();

      const randomGuy2 = await global.db.insertUser();

      /** create three notes */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const parentNote1 = await global.db.insertNote({
        creatorId: creator.id,
      });

      const parentNote2 = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create noteSettings for the note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      /** create note relations */
      await global.db.insertNoteRelation({
        noteId: note.id,
        parentId: parentNote1.id,
      });

      await global.db.insertNoteRelation({
        noteId: parentNote1.id,
        parentId: parentNote2.id,
      });

      /** specify team for root note (randomGuy is in root team) */
      await global.db.insertNoteTeam({
        noteId: parentNote2.id,
        userId: randomGuy.id,
        role: MemberRole.Write,
      });

      /** specify team for parentNote1 (randomGuy is not in this specified team) */
      await global.db.insertNoteTeam({
        noteId: parentNote1.id,
        userId: randomGuy2.id,
        role: MemberRole.Write,
      });

      const accessToken = await global.auth(randomGuy.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json().message).toBe('Permission denied');
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
  });

  describe('GET /note-settings/:notePublicId/team ', () => {
    test.each([
      /** Returns 200 if user is a team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is a team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 401 when the user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
        expectedMessage: 'You must be authenticated to access this resource',
      },

      /** Returns 403 when the the user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },
    ])
    ('Get note team by public id', async ({ role, isAuthorized, expectedStatusCode, expectedMessage }) => {
      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: note.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, the access token is empty */
      let accessToken = '';

      if (isAuthorized) {
        accessToken = global.auth(user.id);
      }

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.json()).toMatchObject([
          {
            noteId: note.id,
            role: MemberRole.Write,
            userId: creator.id,
          },
          {
            noteId: note.id,
            role: MemberRole.Write,
            userId: user.id,
          } ]);
      } else {
        expect(response?.json()).toStrictEqual(
          {
            message: expectedMessage,
          });
      }
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
  });

  describe('PATCH /note-settings/:notePublicId ', () => {
    test.each([
      /** Returns 200 if user is a team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is a team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
      },
    ])
    ('Update note settings by public id', async ({ role, isAuthorized, expectedStatusCode }) => {
      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test note settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      /** Create test team if user is in team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: note.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, accessToken is empty */
      let accessToken = '';

      if (isAuthorized) {
        accessToken = global.auth(user.id);
      }

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

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.json().isPublic).toBe(false);
      }
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
  });

  describe('PATCH /note-settings/:notePublicId/invitation-hash ', () => {
    test.each([
      /** Returns 200 if user is a team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is a team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
      },
    ])
    ('Generate invitation hash', async ({ role, isAuthorized, expectedStatusCode }) => {
      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test note settings */
      const noteSettings = await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      /** Create test team if user is in team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: note.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, accessToken is empty */
      let accessToken = '';

      if (isAuthorized) {
        accessToken = global.auth(user.id);
      }

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          'isPublic': false,
        },
        url: `/note-settings/${note.publicId}/invitation-hash`,
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.json().invitationHash).not.toBe('');

        expect(response?.json().invitationHash).toHaveLength(10);

        /** check if invitation hash is different than the previous */
        expect(response?.json().invitationHash).not.toBe(noteSettings.invitationHash);
      }
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
  });

  describe('PATCH /note-settings/:notePublicId/team', () => {
    test.each([
      /** Returns 200 if user is a team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is a team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
      },
    ])
    ('Update team member role by user id and note id', async ({ role, isAuthorized, expectedStatusCode }) => {
      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test team if user is in team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: note.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, accessToken is empty */
      let accessToken = '';

      if (isAuthorized) {
        accessToken = global.auth(user.id);
      }

      /** Patch member role of existing team member */
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: user.id,
          newRole: MemberRole.Read,
        },
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.body).toBe(MemberRole.Read.toString());
      }
    });

    test('Returns status code 404 and "User does not belong to Note\'s team" message if no such a note exists', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: user.id,
        role: MemberRole.Write,
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

    test('Returns status code 403 and message "You can\'t patch creator\'s role" when you patching creator\'s memberRole', async () => {
      const creator = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const accessToker = await global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToker}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: creator.id,
          newRole: MemberRole.Read,
        },
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json().message).toBe('You can\'t patch creator\'s role');
    });
  });

  describe('DELETE /:notePublicId/team', () => {
    test.each([
      /** Returns 200 if user is a team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is a team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
      },
    ])
    ('Delete user from the team', async ( { role, isAuthorized, expectedStatusCode } ) => {
      const creator = await global.db.insertUser();

      const user = await global.db.insertUser();

      const anotherUser = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create teset team for user whose role will be changed */
      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: anotherUser.id,
        role: MemberRole.Write,
      });

      /** Create test team if user is in team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: note.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, accessToken is empty */
      let accessToken = '';

      if (isAuthorized) {
        accessToken = global.auth(user.id);
      }

      let response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: anotherUser.id,
        },
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.json()).toBe(anotherUser.id);

        response = await global.api?.fakeRequest({
          method: 'GET',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          url: `/note-settings/${note.publicId}/team`,
        });

        expect(response?.json()).toMatchObject([
          {
            'noteId': note.id,
            'userId': creator.id,
            'role': MemberRole.Write,
          },
          {
            'noteId': note.id,
            'userId': user.id,
            'role': role,
          },
        ]);
      }
    });

    test('Returns status code 403 and message "You can\'t remove note\'s creator from the team" when you are trying to remove creator from the team', async () => {
      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const accessToken = await global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: creator.id,
        },
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json().message).toBe('You can\'t remove note\'s creator from the team');
    });
  });

  describe('DELETE /:notePublicId/team', () => {
    test('User is removed from the team by a team member with a Write role', async () => {
      const creator = await global.db.insertUser();

      const RandomGuy = await global.db.insertUser({
        email: 'randomGuy@CodeXmail.com',
        name: 'random guy',
      });

      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      await global.db.insertNoteTeam({
        noteId: note.id,
        userId: RandomGuy.id,
        role: MemberRole.Write,
      });

      const accessToken = await global.auth(creator.id);

      let response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: RandomGuy.id,
        },
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toBe(RandomGuy.id);

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
      });

      expect(response?.json()).toMatchObject([
        {
          'noteId': note.id,
          'userId': creator.id,
          'role': 1,
        },
      ]);
    });

    test('Returns status code 403 and message "You can\'t remove note\'s creator from the team" when you are trying to remove creator from the team', async () => {
      const creator = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const accessToken = await global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note-settings/${note.publicId}/team`,
        body: {
          userId: creator.id,
        },
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json().message).toBe('You can\'t remove note\'s creator from the team');
    });
  });
});
