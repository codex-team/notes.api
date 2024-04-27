import { describe, test, expect } from 'vitest';

describe('Auth API', () => {
  describe('POST /auth', () => {
    test('Returns 401 when refresh token in not valid', async () => {
      const refreshToken = 'EF1JX65xSZ';

      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        body: { token: refreshToken },
      });

      expect(response?.statusCode).toBe(401);

      const body = await response?.json();

      expect(body).toStrictEqual({ message: 'Session is not valid' });
    });

    test('Returns 200 when refresh token is valid and expiration date has not passed', async () => {
      const refreshToken = 'pv-jIqfPj2';

      /**
       * Create test user
       */
      const user = await global.db.insertUser();

      /**
       * Insert session data to the DB with tomorrow expiration date
       */
      await global.db.query(`INSERT INTO public.user_sessions ("user_id", "refresh_token", "refresh_token_expires_at") VALUES (${user.id}, '${refreshToken}', CURRENT_DATE + INTERVAL '1 day')`);

      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        body: { token: refreshToken },
      });

      expect(response?.statusCode).toBe(200);

      const body = await response?.json();

      expect(typeof body.refreshToken).toBe('string');
      expect(body.refreshToken).toBeDefined();
      expect(body.refreshToken).not.toBeNull();
      expect(body.refreshToken).not.toBe('');

      expect(typeof body.accessToken).toBe('string');
      expect(body.accessToken).toBeDefined();
      expect(body.accessToken).not.toBeNull();
      expect(body.accessToken).not.toBe('');
    });

    test('Returns 401 when expiration day has passed', async () => {
      const outdatedToken = 'F5tTF24K9Q';

      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/auth',
        body:{ token: outdatedToken },
      });

      expect(response?.statusCode).toBe(401);

      const body = await response?.json();

      expect(body).toStrictEqual({ message:'Session is not valid' });
    });
  });
});
