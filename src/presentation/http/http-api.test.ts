import { describe, test, expect } from 'vitest';

describe('HTTP API Error Handler', () => {
  describe('JSON Parse Error Handler', () => {
    test('Returns 400 when request body contains not complete JSON', async () => {
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/join/test-hash1',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: '{invalid json',
      });

      expect(response?.statusCode).toBe(400);

      const body = await response?.json();

      expect(body).toStrictEqual({
        message: 'Invalid JSON in request body',
      });
    });

    test('Returns 400 when request body contains malformed JSON', async () => {
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/join/test-hash1',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: '{"key": "value",}',
      });

      expect(response?.statusCode).toBe(400);

      const body = await response?.json();

      expect(body).toStrictEqual({
        message: 'Invalid JSON in request body',
      });
    });

    test('Returns 400 when JSON body is empty', async () => {
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/join/test-hash1',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: '',
      });

      expect(response?.statusCode).toBe(400);

      const body = await response?.json();

      expect(body).toStrictEqual({
        message: 'Invalid JSON in request body',
      });
    });

    test('Does not return 400 for valid JSON', async () => {
      const response = await global.api?.fakeRequest({
        method: 'POST',
        url: '/join/test-hash1',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: '{"key": "value"}',
      });

      expect(response?.statusCode).not.toBe(400);
    });
  });
});
