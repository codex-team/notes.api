import type { Note, NoteInternalId } from '@domain/entities/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type { MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';

export default interface NoteSettingsSharedMethods {
  getUserRoleByUserIdAndNoteId(userId: User['id'], noteId: Note['id']): Promise<MemberRole | undefined>;
  getNoteSettingsByNoteId(noteId: NoteInternalId): Promise<NoteSettings | null>;
}
