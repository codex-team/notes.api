import { describe, test, expect } from 'vitest';

describe('Join API', () => {
  describe('POST /join/:hash', () => {
    test('Returns 406 when user is already in the team', async () => {
      const invitationHash = 'Hzh2hy4igf';

      /**
       * Truncate all tables, which are needed
       * Restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const user = await global.db.insertUser();

      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: user.id,
      });

      /** create test note-settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
        invitationHash,
      });

      await global.db.insertNoteTeam({
        userId: user.id,
        noteId: note.id,
        role: 0,
      });

      const accessToken = global.auth(user.id);

      /** add same user to the same note team */
      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${invitationHash}`,
      });

      expect(response?.statusCode).toBe(406);

      expect(response?.json()).toStrictEqual({
        message: 'User already in team',
      });
    });
    test('Returns 406 when invitation hash is not valid', async () => {
      const hash = 'Jih23y4igf';
      const userId = 4;
      const accessToken = global.auth(userId);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
      });

      expect(response?.statusCode).toBe(406);

      expect(response?.json()).toStrictEqual({
        message: `Wrong invitation`,
      });
    });

    test('Returns 200 when user is added to the team', async () => {
      const invitationHash = 'Hzh2hy4igf';

      /**
       * truncate all tables, which are needed
       * restart autoincrement sequences for data to start with id 1
       *
       * TODO get rid of restarting database data in tests (move to beforeEach)
       */
      await global.db.truncateTables();

      /** create test user */
      const creator = await global.db.insertUser();

      const RandomGuy = await global.db.insertUser({
        email: 'randomGuy@CodeXmail.com',
        name: 'random guy',
      });


      /** create test note for created user */
      const note = await global.db.insertNote({
        creatorId: creator.id,
      });

      /** create test note-settings for created note */
      await global.db.insertNoteSetting({
        noteId: note.id,
        isPublic: true,
        invitationHash,
      });

      const accessToken = global.auth(RandomGuy.id);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${invitationHash}`,
      });

      expect(response?.statusCode).toBe(200);

      expect(response?.json()).toMatchObject({
        result: {
          userId: RandomGuy.id,
          noteId: note.id,
          role: 0,
        },
      });
    });
  });
});
