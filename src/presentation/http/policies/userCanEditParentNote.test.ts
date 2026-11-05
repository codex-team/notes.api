import { describe, test, expect, vi } from 'vitest';
import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';
import userCanEditParentNote from './userCanEditParentNote.js';

describe('userCanEditParentNote policy', () => {
  test.each([
    /** POST /note passes parent note as "parentId" */
    {
      body: { parentId: '47L43yY7dp' },
    },

    /** Relation routes pass parent note as "parentNoteId" */
    {
      body: { parentNoteId: '47L43yY7dp' },
    },
  ])
  ('Replies 406 if parent note id is passed but parent note is not resolved', async ({ body }) => {
    const reply = {
      notAcceptable: vi.fn(),
      forbidden: vi.fn(),
    };
    const getUserRoleByUserIdAndNoteId = vi.fn();

    /** Request of a route without parentNoteResolver: request.parentNote is not set */
    await userCanEditParentNote({
      request: {
        userId: 1,
        body,
      },
      reply,
      domainServices: {
        noteSettingsService: { getUserRoleByUserIdAndNoteId },
      },
    } as unknown as PolicyContext);

    expect(reply.notAcceptable).toHaveBeenCalledWith('Parent note not found');
    expect(reply.forbidden).not.toHaveBeenCalled();
    expect(getUserRoleByUserIdAndNoteId).not.toHaveBeenCalled();
  });

  test('Does nothing if parent note id is not passed', async () => {
    const reply = {
      notAcceptable: vi.fn(),
      forbidden: vi.fn(),
    };
    const getUserRoleByUserIdAndNoteId = vi.fn();

    await userCanEditParentNote({
      request: {
        userId: 1,
        body: {},
      },
      reply,
      domainServices: {
        noteSettingsService: { getUserRoleByUserIdAndNoteId },
      },
    } as unknown as PolicyContext);

    expect(reply.notAcceptable).not.toHaveBeenCalled();
    expect(reply.forbidden).not.toHaveBeenCalled();
    expect(getUserRoleByUserIdAndNoteId).not.toHaveBeenCalled();
  });
});
