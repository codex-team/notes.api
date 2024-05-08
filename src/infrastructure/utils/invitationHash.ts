import { nanoid } from 'nanoid';

/**
 * Create invitation hash
 * Used to invite users to team
 * @param length - length of invitation hash
 */
export function createInvitationHash(length: number = 10): string {
  return nanoid(length);
}
