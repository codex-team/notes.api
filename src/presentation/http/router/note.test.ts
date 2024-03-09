import { MemberRole } from '@domain/entities/team.js';
import { describe, test, expect, beforeEach } from 'vitest';
import type User from '@domain/entities/user.js';

describe('Note API', () => {
  beforeEach(async () => {
    await global.db.truncateTables();
  });
  describe('GET note/resolve-hostname/:hostname ', () => {
    test('Returns note by specified hostname', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note settings */
      const noteSettings = await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
        customHostname: 'codex.so',
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/resolve-hostname/${noteSettings.customHostname}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        note: {
          id: note.publicId,
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
    test.each([
      /** Returns 200 if user is team member with a Read role */
      {
        role: MemberRole.Read,
        isPublic: false,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 200 if user is team member with a Write role */
      {
        role: MemberRole.Write,
        isPublic: false,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 200 if note is public */
      {
        role: null,
        isPublic: true,
        isAuthorized: false,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isPublic: false,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isPublic: false,
        isAuthorized: false,
        expectedStatusCode: 401,
        expectedMessage: 'You must be authenticated to access this resource',
      },
    ])
    ('Returns note with access rights by public id', async ({ role, isPublic, isAuthorized, expectedStatusCode, expectedMessage }) => {
      /** Only if user has a Write role, he can edit the note */
      const canEdit = role === MemberRole.Write;

      /** Create test user - creator of note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: isPublic,
      });

      /** Create test team */
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
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        expect(response?.json()).toMatchObject({
          'note': {
            'id': note.publicId,
          },
          'accessRights': {
            'canEdit': canEdit,
          },
        });
      } else {
        expect(response?.json()).toStrictEqual({
          message: expectedMessage,
        });
      }
    });

    test('Returns 200 if user is team member of parent note with Write role', async () => {
      const creator = await global.db.insertUser();

      const randomGuy = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      const parentNote = await global.db.insertNote({
        creatorId: creator.id,
      });

      await global.db.insertNoteRelation({
        noteId: note.id,
        parentId: parentNote.id,
      });

      await global.db.insertNoteTeam({
        noteId: parentNote.id,
        userId: randomGuy.id,
        role: MemberRole.Write,
      });

      const accessToken = await global.auth(randomGuy.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().note).toMatchObject({
        id: note.publicId,
        content: note.content,
      });
    });

    test('Returns note and parent note by note public id with 200 status', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note - a parent note */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note - a child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: childNote.id,
        isPublic: true,
      });

      /** Create test note relation */
      await global.db.insertNoteRelation({
        parentId: parentNote.id,
        noteId: childNote.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${childNote.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        'note': {
          'id': childNote.publicId,
          'content': childNote.content,
        },
        'parentNote': {
          'id': parentNote.publicId,
          'content': parentNote.content,
        },
        'accessRights': {
          'canEdit': false,
        },
      });
    });

    test('Returns 404 when the note does not exist', async () => {
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
  });

  describe('PATCH note/:notePublicId ', () => {
    test.each([
      /** Returns 200 if user is team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
        expectedMessage: 'You must be authenticated to access this resource',
      },
    ])
    ('Patch note by public id', async ({ role, isAuthorized, expectedStatusCode, expectedMessage }) => {
      /** Only if user has a Write role, he can edit the note */
      const canEdit = role === MemberRole.Write;

      /** Create test user - creator of a note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
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

      const newContent = {
        blocks: [
          {
            id: 'qxnjUh9muR',
            type: 'header',
            data: {
              text: 'sample text',
              level: 1,
            },
          },
        ],
      };

      let response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
        body: {
          content: newContent,
        },
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedStatusCode === 200) {
        response = await global.api?.fakeRequest({
          method: 'GET',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          url: `/note/${note.publicId}`,
        });

        expect(response?.json()).toMatchObject({
          note: {
            id: note.publicId,
            content: newContent,
          },
          accessRights: {
            canEdit: canEdit,
          },
        });
      } else {
        expect(response?.json()).toStrictEqual({
          message: expectedMessage,
        });
      }
    });

    test('Returns status 406 when the public id does not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note/${nonexistentId}`,
        body: {},
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
        expectedMessage: '\'/note/+=*&*5%&&^&-\' is not a valid url component' },
    ])
    ('Returns 400 when public id of the note settings has incorrect characters and length', async ({ id, expectedMessage }) => {
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note/${id}`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('Returns 400 when parentId has incorrect characters and length');
  });

  describe('POST /note', () => {
    test('Should correctly save relation to parent note if parentId passed', async () => {
      const user = await global.db.insertUser();

      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      await global.db.insertNoteSetting({
        noteId: parentNote.id,
        isPublic: true,
      });

      const accessToken = global.auth(user.id);

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note`,
        body: {
          parentId: parentNote.publicId,
          content: {
            blocks: [
              {
                id: 'qxnjUh9muR',
                type: 'header',
                data: {
                  text: 'sample text',
                  level: 1,
                },
              },
            ],
          },
        },
      });

      expect(response?.statusCode).toBe(200);

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${response?.json().id}`,
      });

      expect(response?.json().parentNote).toMatchObject({
        content: parentNote.content,
        id: parentNote.publicId,
      });
    });

    test.todo('Returns 400 when parentId has incorrect characters and lenght');
  });

  describe('DELETE /note/:notePublicId', () => {
    test.each([
      /** Returns 200 if user is team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
        expectedMessage: 'You must be authenticated to access this resource',
      },
    ])
    ('Delete note by public id', async ({ role, isAuthorized, expectedStatusCode, expectedMessage }) => {
      /** Create test user - creator of note */
      const creator = await global.db.insertUser();

      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
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
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      if (expectedStatusCode === 200) {
        expect(response?.statusCode).toBe(expectedStatusCode);
        expect(response?.json().isDeleted).toBe(true);
      } else {
        expect(response?.json()).toStrictEqual({
          message: expectedMessage,
        });
      }
    });

    test('Returns 200 status and "true" if note was removed successfully', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      const accessToken = global.auth(user.id);

      let response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual({ isDeleted: true });

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(404);

      expect(response?.json()).toStrictEqual({ message: 'Note not found' });
    });

    test('Returns 406 when the id does not exist', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      const nonexistentId = 'ishvm5qH84';
      const accessToken = global.auth(user.id);

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${nonexistentId}`,
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
        expectedMessage: '\'/note/+=*&*5%&&^&-\' is not a valid url component' },
    ])
    ('Returns 400 when id has incorrect characters and length', async ({ id, expectedMessage }) => {
      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        url: `/note/${id}`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test('Should remove all note relations containing note id', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note for created user */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note for created user */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create notes relation */
      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      const accessToken = global.auth(user.id);

      let response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${parentNote.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}`,
      });

      expect(response).not.toHaveProperty('parentNote');
    });
  });

  describe('DELETE /note/:publicId/relation', () => {
    let accessToken = '';
    let user: User;

    beforeEach(async () => {
      /** create test user */
      user = await global.db.insertUser();

      accessToken = global.auth(user.id);
    });
    test.each([
      /** Returns 200 if user is team member with a Write role */
      {
        role: MemberRole.Write,
        isAuthorized: true,
        expectedStatusCode: 200,
      },

      /** Returns 403 if user is team member with a Read role */
      {
        role: MemberRole.Read,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 403 if user is not in the team */
      {
        role: null,
        isAuthorized: true,
        expectedStatusCode: 403,
        expectedMessage: 'Permission denied',
      },

      /** Returns 401 if user is not authorized */
      {
        role: null,
        isAuthorized: false,
        expectedStatusCode: 401,
        expectedMessage: 'You must be authenticated to access this resource',
      },
    ])
    ('Unlink any parent from note by it\'s public id', async ({ role, isAuthorized, expectedStatusCode, expectedMessage }) => {
      /* Create second user, who will be the creator of the note */
      const creator = await global.db.insertUser();

      /* Create test child note */
      const childNote = await global.db.insertNote({
        creatorId: creator.id,
      });

      /* Create test parent note */
      const parentNote = await global.db.insertNote({
        creatorId: creator.id,
      });

      /* Create test note relation */
      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      /** Create test team */
      if (role !== null) {
        await global.db.insertNoteTeam({
          noteId: childNote.id,
          userId: user.id,
          role: role,
        });
      }

      /** If user is not authorized, the access token is empty */
      if (!isAuthorized) {
        accessToken = '';
      }

      let response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      if (expectedStatusCode === 200) {
        expect(response?.statusCode).toBe(200);

        expect(response?.json().isDeleted).toBe(true);

        response = await global.api?.fakeRequest({
          method: 'GET',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          url: `/note/${childNote.publicId}`,
        });

        expect(response).not.toHaveProperty('parentNote');
      } else {
        expect(response?.json()).toStrictEqual({
          message: expectedMessage,
        });
      }
    });

    test('Returns 200 and true when note was successfully unlinked', async () => {
      /* create test child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test parent note */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create notes relation */
      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      let response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().isDeleted).toBe(true);

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}`,
      });

      expect(response).not.toHaveProperty('parentNote');
    });

    test('Return 406 when note has no parent', async () => {
      /* create test note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(406);

      expect(response?.json().message).toStrictEqual('Parent note does not exist');
    });

    test('Return 406 when there is no note with that public id', async () => {
      /* id of non-existent note*/
      const nonExistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${nonExistentId}/relation`,
      });

      expect(response?.statusCode).toBe(406);

      expect(response?.json().message).toStrictEqual('Note not found');
    });
  });
});
