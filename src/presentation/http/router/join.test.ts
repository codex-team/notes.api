import { describe, test, expect } from 'vitest';

describe('Join API', () => {
  describe('POST /join/:hash', () => {
    test('Returns 406 when user is already in the team', async () => {
      const hash = 'Hzh2hy4igf';
      const userId = 1;
      const accessToken = global.auth(userId);

      // create test user (id 1)
      await global.db.query(`INSERT INTO public.users ("email", "name", "created_at") VALUES ('testemal@CodeXmail.com', 'CodeX', CURRENT_DATE)`);

      // create test note (id 1) for created user
      await global.db.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "public_id") VALUES ('{}', 1, CURRENT_DATE, 'TJmEb89e0l')`);

      // create test note-settings for created note
      await global.db.query(`INSERT INTO public.note_settings ("note_id", "is_public", "invitation_hash") VALUES (1, 't', '${hash}')`);

      let response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
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
        url: `/join/${hash}`,
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
      const hash = 'Hzh2hy4igf';
      const userId = 1;
      const accessToken = global.auth(userId);

      // create test user (id 1)
      await global.db.query(`INSERT INTO public.users ("email", "name", "created_at") VALUES ('testemal@CodeXmail.com', 'CodeX', CURRENT_DATE)`);

      // create test note (id 1) for created user
      await global.db.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "public_id") VALUES ('{}', 1, CURRENT_DATE, 'TJmEb89e0l')`);

      // create test note-settings for created note
      await global.db.query(`INSERT INTO public.note_settings ("note_id", "is_public", "invitation_hash") VALUES (1, 't', '${hash}')`);


      const response = await global.api?.fakeRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        url: `/join/${hash}`,
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
