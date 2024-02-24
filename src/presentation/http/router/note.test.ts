
import { describe, test, expect, beforeEach } from 'vitest';

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

    test('Returns 404 when the id does not exist', async () => {
      const nonexistentId = 'ishvm5qH84';

      const response = await global.api?.fakeRequest({
        method: 'GET',
        url: `/note/${nonexistentId}`,
      });

      expect(response?.statusCode).toBe(404);

      expect(response?.json()).toStrictEqual({ message: 'Note not found' });
    });

    test.each([
      {
        id: 'mVz3iHuez',
        expectedMessage: 'params/notePublicId must NOT have fewer than 10 characters',
      },

      {
        id: 'cR8eqF1mFf0',
        expectedMessage: 'params/notePublicId must NOT have more than 10 characters',
      },

      {
        id: '+=*&*5%&&^&-',
        expectedMessage: '\'/note/+=*&*5%&&^&-\' is not a valid url component',
      },
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

      test.todo('Returns 200 when note is private, user is in team but is not creator');
      test.todo('Returns canEdit=true, when user is authorized, is in the team and is not creator');
    });
  });

  describe('PATCH note/:notePublicId ', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Update note by public id with 200 status, user is creator of the note', async () => {
      const user = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: user.id,
      });

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
        url: `/note/${note.publicId}`,
        body: {
          'content': { new: 'content added' },
        },
      });

      expect(response?.statusCode).toBe(200);
    });

    test('Returns status 401 when the user is not authorized', async () => {
      const user = await global.db.insertUser();

      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note/${note.publicId}`,
        body: {
          'content': { new: 'content added' },
        },
      });

      expect(response?.statusCode).toBe(401);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
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
      {
        id: 'mVz3iHuez',
        expectedMessage: 'params/notePublicId must NOT have fewer than 10 characters',
      },

      {
        id: 'cR8eqF1mFf0',
        expectedMessage: 'params/notePublicId must NOT have more than 10 characters',
      },

      {
        id: '+=*&*5%&&^&-',
        expectedMessage: '\'/note/+=*&*5%&&^&-\' is not a valid url component',
      },
    ])
    ('Returns 400 when public id of the note settings has incorrect characters and length', async ({
      id,
      expectedMessage,
    }) => {
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        url: `/note/${id}`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(expectedMessage);
    });

    test.todo('Returns 400 when parentId has incorrect characters and length');
    test.todo('Return 200 when user is not the creator, but a team member with a Write role');
    test.todo('Return 403 when user has no Write role and he is not a creator');
  });

  describe('POST /note', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
    });
    test('Should correctly save relation to parent note if parentId passed', async () => {
      const user = await global.db.insertUser();

      const parentNote = await global.db.insertNote({
        creatorId: user.id,
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
        },
      });

      expect(response?.statusCode).toBe(200);

      let body = await response?.json();

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${body.id}`,
      });

      body = await response?.json();

      expect(body.parentNote).toMatchObject({
        id: parentNote.publicId,
        content: parentNote.content,
      });
    });

    test.todo('Returns 400 when parentId has incorrect characters and lenght');
  });

  describe('DELETE /note/:notePublicId', () => {
    beforeEach(async () => {
      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * @todo get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();
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

    test('Returns 403 when user is not creator of the note', async () => {
      /** Create test user */
      const creator = await global.db.insertUser({
        email: 'test1@codexmail.com',
        name: 'CodeX1',
      });

      /** Create test user */
      const nonCreator = await global.db.insertUser({
        email: 'test2@codexmail.com',
        name: 'CodeX2',
      });

      /** Create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const accessToken = global.auth(nonCreator.id);

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(403);

      expect(response?.json()).toStrictEqual({ message: 'Permission denied' });
    });

    test('Returns 401 when the user is not authorized', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'DELETE',
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(401);

      expect(response?.json()).toStrictEqual({ message: 'You must be authenticated to access this resource' });
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
      {
        id: 'mVz3iHuez',
        expectedMessage: 'params/notePublicId must NOT have fewer than 10 characters',
      },

      {
        id: 'cR8eqF1mFf0',
        expectedMessage: 'params/notePublicId must NOT have more than 10 characters',
      },

      {
        id: '+=*&*5%&&^&-',
        expectedMessage: '\'/note/+=*&*5%&&^&-\' is not a valid url component',
      },
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

  describe('PATCH /note/:notePublicId/parent', () => {
    test('Returns 200 when parent was successfully updated', async () => {
      const childNotePublicId = '9OYDD9d4_Y';

      const parentNotePublicId = 'Tocn1f7rQS';

      const newParentNotePublicId = 'lMkesQ1gpg';

      await global.db.truncateTables();

      const creator = await global.db.insertUser({
        email: 'a@a.com',
        name: 'test user',
      });

      const childNote = await global.db.insertNote({
        creatorId: creator.id,
        publicId: childNotePublicId,
      });

      const parentNote = await global.db.insertNote({
        creatorId: creator.id,
        publicId: parentNotePublicId,
      });

      await global.db.insertNote({
        creatorId: creator.id,
        publicId: newParentNotePublicId,
      });

      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      const accessToken = global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentId: newParentNotePublicId,
        },
        url: `/note/${childNotePublicId}/parent`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toStrictEqual({ isUpdated: true });
    });

    test('Returns 500 when parentId is the same as childId', async () => {
      const childNotePublicId = '9OYDD9d4_Y';

      const parentNotePublicId = 'Tocn1f7rQS';

      await global.db.truncateTables();

      const creator = await global.db.insertUser({
        email: 'a@a.com',
        name: 'test user',
      });

      const childNote = await global.db.insertNote({
        creatorId: creator.id,
        publicId: childNotePublicId,
      });

      const parentNote = await global.db.insertNote({
        creatorId: creator.id,
        publicId: parentNotePublicId,
      });

      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      const accessToken = global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentId: childNotePublicId,
        },
        url: `/note/${childNotePublicId}/parent`,
      });

      expect(response?.statusCode).toBe(500);

      expect(response?.json().message).toStrictEqual('Parent note is the same as the child note');
    });

    test('Return 500 when parent note does not exist', async () => {
      const childNotePublicId = '9OYDD9d4_Y';

      const parentNotePublicId = 'Tocn1f7rQS';

      await global.db.truncateTables();

      const creator = await global.db.insertUser({
        email: 'a@a.com',
        name: 'test user',
      });

      await global.db.insertNote({
        creatorId: creator.id,
        publicId: childNotePublicId,
      });

      const accessToken = global.auth(creator.id);

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentId: parentNotePublicId,
        },
        url: `/note/${childNotePublicId}/parent`,
      });

      expect(response?.statusCode).toBe(500);

      expect(response?.json().message).toStrictEqual('Incorrect parent note');
    });
  });
  test.todo('Tests with access rights');

  test.todo('API should not return internal id and "publicId".  It should return only "id" which is public id.');
});
