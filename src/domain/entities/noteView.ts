import type { NoteInternalId } from '@domain/entities/note.ts';
import type User from '@domain/entities/user.ts';

export default interface NoteView {
    /**
     * Unique property identifier
     */
    id: number,

    /**
     * NoteInternalId
     */
    noteId: NoteInternalId,

    /**
     * Id of the user
     */
    userId: User['id'],

    /**
     * Time when note was visited
     */
    visitedAt: string,
}