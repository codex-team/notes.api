import { MemberRole } from '@domain/entities/team.js';
import { describe, test, expect, beforeEach } from 'vitest';
import type User from '@domain/entities/user.js';

describe('Note API', () => {
  /**
   * preinstalled tools
   */
  const headerTool = {
    exportName: 'Header',
    id: '1',
    isDefault: true,
    name: 'header',
    source: {
      cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/header@2.8.1/dist/header.umd.min.js',
    },
    title: 'Heading',
    userId: null,
  };

  const paragraphTool = {
    name: 'paragraph',
    exportName: 'Paragraph',
    id: '2',
    isDefault: true,
    source: {
      cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/paragraph@2.11.3/dist/paragraph.umd.min.js',
    },
    title: 'Paragraph',
    userId: null,
  };

  const listTool = {
    exportName: 'List',
    id: '3',
    isDefault: true,
    name: 'list',
    source: {
      cdn: 'https://cdn.jsdelivr.net/npm/@editorjs/list@1.9.0/dist/list.umd.min.js',
    },
    title: 'List',
    userId: null,
  };

  /**
   * Default note content mock
   * Used for inserting note content
   */
  const DEFAULT_NOTE_CONTENT = {
    blocks: [
      {
        id: 'mJDq8YbvqO',
        type: headerTool.name,
        data: {
          text: 'text',
        },
      },
      {
        id: 'DeL0QehzGe',
        type: paragraphTool.name,
        data: {
          text: 'fdgsfdgfdsg',
          level: 2,
        },
      },
    ],
  };

  /**
   * Alternative note content mock
   * Used for patching note content
   */
  const ALTERNATIVE_NOTE_CONTENT = {
    blocks: [
      {
        id: 'mJDq8YbvqO',
        type: headerTool.name,
        data: {
          text: 'another text',
        },
      },
      {
        id: 'DeL0QehzGe',
        type: paragraphTool.name,
        data: {
          text: 'fdgsfdgfdsg',
          level: 2,
        },
      },
    ],
  };

  /**
   * Note tools used in default, alternative and large NOTE_CONTENT constants
   */
  const DEFAULT_NOTE_TOOLS = [
    {
      name: headerTool.name,
      id: headerTool.id,
    },
    {
      name: paragraphTool.name,
      id: paragraphTool.id,
    },
  ];

  /**
   * Note content with large text field
   * Used for patching note content
   */
  const LARGE_NOTE_CONTENT = {
    blocks: [
      {
        id: 'mJDq8YbvqO',
        type: paragraphTool.name,
        data: {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.',
        },
      },
      {
        id: 'DeL0QehzGe',
        type: headerTool.name,
        data: {
          text: 'fdgsfdgfdsg',
          level: 2,
        },
      },
    ],
  };

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
        tools: DEFAULT_NOTE_TOOLS,
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
        tools: [headerTool, paragraphTool],
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
        tools: DEFAULT_NOTE_TOOLS,
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
          note: {
            id: note.publicId,
          },
          accessRights: {
            canEdit: canEdit,
          },
          tools: [headerTool, paragraphTool],
        });

        /** Check if response has createdAt, updatedAt and creatorId fields */
        expect(response?.json().note.createdAt).not.toBeNull();
        expect(response?.json().note.updatedAt).not.toBeNull();
        expect(response?.json().note.creatorId).to.be.equal(creator.id);
      } else {
        expect(response?.json()).toStrictEqual({
          message: expectedMessage,
        });
      }
    });

    test.each([
      /** Returns 200 and note with accessRights if user is in inherited team with role write */
      {
        roleInRootTeam: MemberRole.Write,
        intermidiateTeamDefined: false,
        expectedStatusCode: 200,
      },
      /** Returns 403 and 'Permission denied' message if intermediate team without user was inherited */
      {
        roleInRootTeam: MemberRole.Write,
        intermidiateTeamDefined: true,
        roleInIntermidiateTeam: null,
        expectedMessage: 'Permission denied',
        expectedStatusCode: 403,
      },
      /** Returns 200 and note with accessRights if user is in inherited team with role read */
      {
        roleInRootTeam: MemberRole.Read,
        intermidiateTeamDefined: false,
        expectedStatusCode: 200,
      },
      /** Returns 403 and 'Permission denied' message if intermediate team without user was inherited */
      {
        roleInRootTeam: MemberRole.Read,
        intermidiateTeamDefined: true,
        roleInIntermidiateTeam: null,
        expectedMessage: 'Permission denied',
        expectedStatusCode: 403,
      },
      /** Returns 403 and 'Permission denied' message if user is not in inherited team of the note */
      {
        roleInRootTeam: null,
        intermidiateTeamDefined: false,
        expectedMessage: 'Permission denied',
        expectedStatusCode: 403,
      },
      /** Returns 403 and 'Permission denied' message if intermediate team without user was inherited */
      {
        roleInRootTeam: null,
        intermidiateTeamDefined: true,
        roleInIntermidiateTeam: null,
        expectedMessage: 'Permission denied',
        expectedStatusCode: 403,
      },
      /** Returns 200 and note if user in inherited team with write role, even if root team have no such a user */
      {
        roleInRootTeam: null,
        intermidiateTeamDefined: true,
        roleInIntermidiateTeam: MemberRole.Write,
        expectedStatusCode: 200,
      },
    ])
    ('Returns note by public id with recursive access check', async ({ roleInRootTeam, expectedStatusCode, intermidiateTeamDefined, roleInIntermidiateTeam, expectedMessage }) => {
      roleInIntermidiateTeam = roleInIntermidiateTeam ?? undefined;

      /** create three users */
      const creator = await global.db.insertUser();

      const randomGuy = await global.db.insertUser();

      const randomGuy2 = await global.db.insertUser();

      /** create three notes */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      const intermidiateNote = await global.db.insertNote({
        creatorId: creator.id,
      });

      const rootNote = await global.db.insertNote({
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
        parentId: intermidiateNote.id,
      });

      await global.db.insertNoteRelation({
        noteId: intermidiateNote.id,
        parentId: rootNote.id,
      });

      /** specify team for root note (randomGuy is in root team) */
      if (roleInRootTeam !== null) {
        await global.db.insertNoteTeam({
          noteId: rootNote.id,
          userId: randomGuy.id,
          role: roleInRootTeam,
        });
      }

      /** specify team for intermidiateNote */
      if (intermidiateTeamDefined) {
        await global.db.insertNoteTeam({
          noteId: intermidiateNote.id,
          userId: randomGuy2.id,
          role: MemberRole.Write,
        });
      }
      if (roleInIntermidiateTeam !== undefined) {
        await global.db.insertNoteTeam({
          noteId: intermidiateNote.id,
          userId: randomGuy.id,
          role: roleInIntermidiateTeam,
        });
      }

      /** Compute canEdit variable */

      const canEdit = (intermidiateTeamDefined === true && roleInIntermidiateTeam === MemberRole.Write) || (intermidiateTeamDefined === false && roleInRootTeam === MemberRole.Write);

      const accessToken = global.auth(randomGuy.id);

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(expectedStatusCode);

      if (expectedMessage !== undefined) {
        expect(response?.json().message).toStrictEqual(expectedMessage);
      } else {
        expect(response?.json()).toMatchObject({ note: {
          id: note.publicId,
        },
        accessRights: {
          canEdit: canEdit,
        } });
      }
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
        note: {
          id: childNote.publicId,
          content: childNote.content,
        },
        parentNote: {
          id: parentNote.publicId,
          content: parentNote.content,
        },
        accessRights: {
          canEdit: false,
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

    test('Returns one parents note in case when note has one parent', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create access token for the user */
      const accessToken = global.auth(user.id);

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
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        parents: [
          {
            id: parentNote.publicId,
            content: parentNote.content,
          },
        ],
      });
    });

    test('Returns note parents in correct order in case when parents created in a non-linear order', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create access token for the user */
      const accessToken = global.auth(user.id);

      /** Create test note - a grand parent note */
      const firstNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note - a parent note */
      const secondNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note - a child note */
      const thirdNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: secondNote.id,
        isPublic: true,
      });

      /** Create note relation between parent and grandParentNote */
      await global.db.insertNoteRelation({
        parentId: firstNote.id,
        noteId: thirdNote.id,
      });

      /** Create test note relation */
      await global.db.insertNoteRelation({
        parentId: thirdNote.id,
        noteId: secondNote.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${secondNote.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        parents: [
          {
            id: firstNote.publicId,
            content: firstNote.content,
          },
          {
            id: thirdNote.publicId,
            content: thirdNote.content,
          },
        ],
      });
    });

    test('Returns empty array in case where there is no relation exist for the note', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      /** Create access token for the user */
      const accessToken = global.auth(user.id);

      /** Create test note - a child note */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        parents: [],
      });
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
            type: headerTool.name,
            data: {
              text: 'sample text',
              level: 1,
            },
          },
        ],
      };

      const newTools = [
        {
          name: headerTool.name,
          id: headerTool.id,
        },
      ];

      let response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
        body: {
          content: newContent,
          tools: newTools,
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

    test('UpdatedAt field is updated when note is modified', async () => {
      /** Create test user */
      const user = await global.db.insertUser();

      const accessToken = global.auth(user.id);

      /** Create test note */
      let note = await global.db.insertNote({
        creatorId: user.id,
      });

      /** Create test note settings */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      /** Save the original value of updatedAt */
      const originalUpdatedAt = note.updatedAt;

      const newContent = {
        blocks: [
          {
            id: 'qxnjUh9muR',
            type: headerTool.name,
            data: {
              text: 'sample text',
              level: 1,
            },
          },
        ],
      };

      const newTools = [
        {
          name: headerTool.name,
          id: headerTool.id,
        },
      ];

      /** Modify the note */
      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
        body: {
          content: newContent,
          tools: newTools,
        },
      });

      /** Check if note was modified successfully */
      expect(response?.statusCode).toBe(200);

      expect(response?.json().updatedAt).not.toEqual(originalUpdatedAt);
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

  describe('POST and PATCH note correctly save note history records', () => {
    const newContentWithSmallChanges = ALTERNATIVE_NOTE_CONTENT;
    const newContentWithSignificantChanges = LARGE_NOTE_CONTENT;

    test.each([
      /**
       * Patching note content with small changes
       * History should have only one record inserted on note creation
       */
      {
        newNoteContent: newContentWithSmallChanges,
        historyRecordAdded: false,
      },
      /**
       * Patching note content with large changes
       * History should have two records, inserted on note creation and on note patch
       */
      {
        newNoteContent: newContentWithSignificantChanges,
        historyRecordAdded: true,
      },
    ])('On note creation and note updates history records saves correctly', async ({ newNoteContent, historyRecordAdded }) => {
      const user = await global.db.insertUser();

      const accessToken = global.auth(user.id);

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          content: DEFAULT_NOTE_CONTENT,
          tools: DEFAULT_NOTE_TOOLS,
        },
        url: '/note',
      });

      const noteId = response?.json().id;

      response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          content: newNoteContent,
          tools: DEFAULT_NOTE_TOOLS,
        },
        url: `/note/${noteId}`,
      });

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${noteId}/history`,
      });

      if (historyRecordAdded) {
        expect(response?.json().noteHistoryMeta).toHaveLength(2);
      } else {
        expect(response?.json().noteHistoryMeta).toHaveLength(1);
      }
    });
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
          tools: [
            {
              name: headerTool.name,
              id: headerTool.id,
            },
          ],
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
    test.each([
      /**
       * Specified extra tools
       */
      {
        noteTools: DEFAULT_NOTE_TOOLS,
        noteContent: {
          blocks: [
            {
              id: 'qxnjUh9muR',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
            {
              id: 'qafjG34mus',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
          ],
        },
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
      /**
       * All tools specified correctly
       */
      {
        noteTools: [
          {
            name: headerTool.name,
            id: headerTool.id,
          },
        ],
        noteContent: {
          blocks: [
            {
              id: 'qxnjUh9muR',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
            {
              id: 'qafjG34mus',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
          ],
        },
        expectedStatusCode: 200,
        expectedMessage: null,
      },
      /**
       * Specified tools with incorrect name
       */
      {
        noteTools: [
          {
            name: 'faketool',
            id: headerTool.id,
          },
        ],
        noteContent: {
          blocks: [
            {
              id: 'qxnjUh9muR',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
            {
              id: 'qafjG34mus',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
          ],
        },
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
      /**
       * Specified tools with incorrect id
       */
      {
        noteTools: [
          {
            name: headerTool.name,
            id: 'fakeId',
          },
        ],
        noteContent: {
          blocks: [
            {
              id: 'qxnjUh9muR',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
            {
              id: 'qafjG34mus',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
          ],
        },
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
      /**
       * Specified less tools
       */
      {
        noteTools: [],
        noteContent: {
          blocks: [
            {
              id: 'qxnjUh9muR',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
            {
              id: 'qafjG34mus',
              type: headerTool.name,
              data: {
                text: 'sample text',
                level: 1,
              },
            },
          ],
        },
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
    ])
    ('Should save tools that were used for note creation', async ({ noteTools, noteContent, expectedMessage, expectedStatusCode }) => {
      const user = await global.db.insertUser();

      const accessToken = global.auth(user.id);

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note`,
        body: {
          content: noteContent,
          tools: noteTools,
        },
      });

      if (expectedStatusCode === 200) {
        expect(response?.statusCode).toBe(expectedStatusCode);

        response = await global.api?.fakeRequest({
          method: 'GET',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          url: `/note/${response?.json().id}`,
        });
        expect(response?.json().tools).toMatchObject(noteTools);
      } else {
        expect(response?.statusCode).toBe(expectedStatusCode);
        expect(response?.json().message).toBe(expectedMessage);
      }
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

    test('Returns 200 and isUpdated=true when note was successfully unlinked', async () => {
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
      /* id of non-existent note */
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

  describe('PATCH /note/:notePublicId/relation', () => {
    let accessToken = '';
    let user: User;

    beforeEach(async () => {
      /** create test user */
      user = await global.db.insertUser();

      accessToken = global.auth(user.id);
    });
    test('Returns 200 and isUpdated=true when parent was successfully updated', async () => {
      /* create test child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test parent note */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test note, that will be new parent for the child note */
      const newParentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create note settings for child note */
      await global.db.insertNoteSetting({
        noteId: childNote.id,
        isPublic: true,
      });

      /* create test relation */
      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      let response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: newParentNote.publicId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json().isUpdated).toBe(true);

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}`,
      });

      expect(response?.json().parentNote.id).toBe(newParentNote.publicId);
    });

    test('Returns 400 when parent is the same as child', async () => {
      /* create test child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test parent note */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test note relation */
      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: childNote.publicId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(`Forbidden relation. Note can't be a child of own child`);
    });

    test('Return 400 when parent note does not exist', async () => {
      const nonExistentParentId = '47L43yY7dp';

      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: nonExistentParentId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual('Incorrect parent note');
    });

    test('Return 400 when circular reference occurs', async () => {
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: childNote.publicId,
        },
        url: `/note/${parentNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(`Forbidden relation. Note can't be a child of own child`);
    });
  });

  describe('POST /note/:notePublicId/relation', () => {
    let accessToken = '';
    let user: User;

    beforeEach(async () => {
      /** create test user */
      user = await global.db.insertUser();

      accessToken = global.auth(user.id);
    });
    test('Returns 200 and isCreated=true when relation was successfully created', async () => {
      /* create test child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test parent note */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create note settings for child note */
      await global.db.insertNoteSetting({
        noteId: childNote.id,
        isPublic: true,
      });

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: parentNote.publicId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(200);

      response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${childNote.publicId}`,
      });

      expect(response?.json().parentNote.id).toBe(parentNote.publicId);
    });

    test('Returns 400 when note already has parent note', async () => {
      /* create test child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test parent note */
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test note, that will be new parent for the child note */
      const newParentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      /* create test relation */
      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: newParentNote.publicId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual('Note already has parent note');
    });

    test('Returns 400 when parent is the same as child', async () => {
      /* create test child note */
      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: childNote.publicId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(`Forbidden relation. Note can't be a child of own child`);
    });

    test('Return 400 when parent note does not exist', async () => {
      const nonExistentParentId = '47L43yY7dp';

      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: nonExistentParentId,
        },
        url: `/note/${childNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual('Incorrect parent note Id');
    });

    test('Return 400 when circular reference occurs', async () => {
      const parentNote = await global.db.insertNote({
        creatorId: user.id,
      });

      const childNote = await global.db.insertNote({
        creatorId: user.id,
      });

      await global.db.insertNoteRelation({
        noteId: childNote.id,
        parentId: parentNote.id,
      });

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          parentNoteId: childNote.publicId,
        },
        url: `/note/${parentNote.publicId}/relation`,
      });

      expect(response?.statusCode).toBe(400);

      expect(response?.json().message).toStrictEqual(`Forbidden relation. Note can't be a child of own child`);
    });
  });

  describe('PATCH /note/:notePublicId', () => {
    const tools = [headerTool, paragraphTool];

    test.each([
      /**
       * Specified more tools than used in note content
       */
      {
        noteTools: [
          {
            name: headerTool.name,
            id: headerTool.id,
          },
          {
            name: paragraphTool.name,
            id: paragraphTool.id,
          },
          {
            name: listTool.name,
            id: listTool.id,
          },
        ],
        noteContent: DEFAULT_NOTE_CONTENT,
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
      /**
       * All tools specified correctly
       */
      {
        noteTools: DEFAULT_NOTE_TOOLS,
        noteContent: DEFAULT_NOTE_CONTENT,
        expectedStatusCode: 200,
        expectedMessage: null,
      },
      /**
       * Specified less tools than used in note content
       */
      {
        noteTools: [],
        noteContent: DEFAULT_NOTE_CONTENT,
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
      /**
       * Specified tools with incorrect name
       */
      {
        noteTools: [
          {
            name: 'fakename',
            id: headerTool.id,
          },
        ],
        noteContent: DEFAULT_NOTE_CONTENT,
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
      /**
       * Specified tools with incorrect id
       */
      {
        noteTools: [
          {
            name: headerTool.name,
            id: 'fakeid',
          },
          {
            name: listTool.name,
            id: 'anotherfake',
          },
        ],
        noteContent: DEFAULT_NOTE_CONTENT,
        expectedStatusCode: 400,
        expectedMessage: 'Incorrect tools passed',
      },
    ])
    ('Should patch note tools on note update', async ({ noteTools, noteContent, expectedStatusCode, expectedMessage }) => {
      const user = await global.db.insertUser();

      const accessToken = global.auth(user.id);

      const note = await global.db.insertNote({ creatorId: user.id });

      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
      });

      let response = await global.api?.fakeRequest({
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: {
          content: noteContent,
          tools: noteTools,
        },
        url: `/note/${note.publicId}`,
      });

      if (expectedStatusCode === 200) {
        expect(response?.statusCode).toBe(expectedStatusCode),

        response = await global.api?.fakeRequest({
          method: 'GET',
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          url: `/note/${note.publicId}`,
        });

        expect(response?.json().tools).toMatchObject(tools);
      } else {
        expect(response?.statusCode).toBe(expectedStatusCode);
        expect(response?.json().message).toBe(expectedMessage);
      }
    });
  });

  describe('GET /note/:notePublicId/history', () => {
    test.each([
      /**
       * User can not edit the note state
       * Should return permission denied response
       */
      {
        authorized: true,
        userCanEdit: false,
        expectedMessage: 'Permission denied',
      },
      /**
       * Unauthorized state
       * Should return unauthorized response
       */
      {
        authorized: false,
        userCanEdit: true,
        expectedMessage: 'You must be authenticated to access this resource',
      },
      /**
       * Should return array of history records
       */
      {
        authorized: true,
        userCanEdit: true,
        expectedMessage: null,
      },
    ])('Should return note history preview by note id', async ({ authorized, userCanEdit, expectedMessage }) => {
      /**
       * Creator of the note
       */
      const creator = await global.db.insertUser();

      /**
       * User who wants to check note history
       */
      const user = await global.db.insertUser();

      /**
       * Access token of the user who wants to check note history
       */
      let userAccessToken: string = '';

      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** Insert note settings mock */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: false,
      });

      if (authorized) {
        userAccessToken = global.auth(user.id);
      }

      if (userCanEdit) {
        await global.db.insertNoteTeam({
          noteId: 1,
          userId: user.id,
          role: MemberRole.Write,
        });
      }

      /** Insert new note history record mock */
      const history = await global.db.insertNoteHistory({
        noteId: note.id,
        userId: creator.id,
        content: LARGE_NOTE_CONTENT,
        tools: DEFAULT_NOTE_TOOLS,
      });

      /**
       * Get note history
       */
      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${userAccessToken}`,
        },
        url: `/note/${note.publicId}/history`,
      });

      if (expectedMessage !== null) {
        expect(response?.json()).toStrictEqual({ message: expectedMessage });
      } else {
        expect(response?.json().noteHistoryMeta).toHaveLength(2);
        expect(response?.json().noteHistoryMeta[1]).toMatchObject({
          userId: creator.id,
          user: {
            name: creator.name,
            photo: creator.photo,
          },
        });

        expect(response?.json().noteHistoryMeta[0]).toMatchObject({
          id: history.id,
          userId: history.userId,
          createdAt: history.createdAt,
          user: {
            name: creator.name,
            photo: creator.photo,
          },
        });
      }
    });
  });

  describe('GET /note/:notePublicId/history/:historyId', () => {
    test.each([
      /**
       * User can not edit the note state
       * Should return permission denied response
       */
      {
        authorized: true,
        userCanEdit: false,
        expectedMessage: 'Permission denied',
      },
      /**
       * Unauthorized state
       * Should return unauthorized response
       */
      {
        authorized: false,
        userCanEdit: true,
        expectedMessage: 'You must be authenticated to access this resource',
      },
      /**
       * User is authorized and can edit the note
       * Should return history record that is inserted
       */
      {
        authorized: true,
        userCanEdit: true,
        expectedMessage: null,
      },
    ])('Should return certain note history record by it\'s id', async ({ authorized, userCanEdit, expectedMessage }) => {
      const creator = await global.db.insertUser();

      const note = await global.db.insertNote({ creatorId: creator.id });

      const history = await global.db.insertNoteHistory({
        userId: creator.id,
        noteId: note.id,
        content: DEFAULT_NOTE_CONTENT,
        tools: DEFAULT_NOTE_TOOLS,
      });

      const user = await global.db.insertUser();

      let accessToken: string = '';

      if (authorized) {
        accessToken = global.auth(user.id);
      }

      if (userCanEdit) {
        await global.db.insertNoteTeam({
          userId: user.id,
          noteId: note.id,
          role: MemberRole.Write,
        });
      }

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}/history/${history.id}`,
      });

      if (expectedMessage !== null) {
        expect(response?.json()).toStrictEqual({ message: expectedMessage });
      } else {
        expect(response?.json()).toStrictEqual({
          noteHistoryRecord: {
            id: history.id,
            userId: history.userId,
            noteId: note.publicId,
            createdAt: history.createdAt,
            content: history.content,
            tools: history.tools,
            user: {
              name: creator.name,
              photo: creator.photo,
            },
          },
        });
      }
    });
  });

  describe('DELETE /note/:noteId', () => {
    test('Delete note history on note deletion', async () => {
      /**
       * Insert test user
       */
      const user = await global.db.insertUser();

      /**
       * Authorization for user
       */
      const accessToken = global.auth(user.id);

      /**
       * Insert test note, note history record will be inserted automatically
       */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      /**
       * Delete note
       */
      await global.api?.fakeRequest({
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}`,
      });

      const response = await global.api?.fakeRequest({
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/note/${note.publicId}/history`,
      });

      expect(response?.json().message).toBe('Note not found');
    });
  });
});
