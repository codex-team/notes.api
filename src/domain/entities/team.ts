import type { NoteInternalId, NotePublicId } from './note.js';
import type User from './user.js';

export enum MemberRole {
  /**
   * Team member can only read notes
   */
  Read = 0,

  /**
   * Team member can read and write notes
   */
  Write = 1
}

/**
 * Class representing a team entity
 * Team is a relation between note and user, which shows what user can do with note
 */
export interface TeamMember {
  /**
   * Team relation id
   */
  id: number;

  /**
   * Note ID
   */
  noteId: NoteInternalId;

  /**
   * Team member user id
   */
  userId: User['id'];

  /**
   * Team member role, show what user can do with note
   */
  role: MemberRole;
}

/**
 * Team member public entity sends to user with public id of the note
 */
export type TeamMemberPublic = Omit<TeamMember, 'noteId'> & { noteId: NotePublicId };

export type Team = TeamMember[];

export type TeamMemberCreationAttributes = Omit<TeamMember, 'id'>;
