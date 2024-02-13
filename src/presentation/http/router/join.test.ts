import { describe, test, expect } from 'vitest';

describe('Join API', () => {
  describe('POST /join/:hash', () => {
    test('Returns 406 when user is already in the team', async () => {
      const invitationHash = 'Hzh2hy4igf';
      const userId = 1;
      const accessToken = global.auth(userId);

      test.todo('get rid of restarting database data in tests (use restart-database-data script in beforeEach)');
      // truncate all tables, which are needed
      await global.db.query(`TRUNCATE public.users, public.notes, public.note_settings CASCADE`);

      // restart autoincrement sequences for data to start with id 1
      await global.db.query(`ALTER sequence users_id_seq RESTART WITH 1`);
      await global.db.query(`ALTER sequence notes_id_seq RESTART WITH 1`);
      await global.db.query(`ALTER sequence note_settings_id_seq RESTART WITH 1`);

      // create test user (id 1)
      await global.db.insertUser({
        email: 'testemal@CodeXmail.com',
        name: 'CodeX',
      });

      // create test note (id 1) for created user
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'TJmEb89e0l',
      });

      // create test note-settings for created note
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: true,
        invitationHash,
      });

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${invitationHash}`,
      });

      // check if we added user to team
      expect(response?.json()).toMatchObject({
        result: {
          userId,
          noteId: 1,
          role: 0,
        },
      });

      // add same user to the same note team
      response = await global.api?.fakeRequest({
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
      const userId = 1;
      const accessToken = global.auth(userId);

      test.todo('get rid of restarting database data in tests (use restart-database-data script in beforeEach)');
      // truncate all tables, which are needed
      await global.db.query(`TRUNCATE public.users, public.notes, public.note_settings, public.note_teams CASCADE`);

      // restart autoincrement sequences for data to start with id 1
      await global.db.query(`ALTER sequence users_id_seq RESTART WITH 1`);
      await global.db.query(`ALTER sequence notes_id_seq RESTART WITH 1`);
      await global.db.query(`ALTER sequence note_settings_id_seq RESTART WITH 1`);

      // create test user (id 1)
      await global.db.insertUser({
        email: 'testemal@CodeXmail.com',
        name: 'CodeX',
      });


      // create test note (id 1) for created user
      await global.db.insertNote({
        creatorId: 1,
        publicId: 'TJmEb89e0l',
      });

      // create test note-settings for created note
      await global.db.insertNoteSetting({
        noteId: 1,
        isPublic: true,
        invitationHash,
      });
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
          userId,
          noteId: 1,
          role: 0,
        },
      });
    });
  });
});
