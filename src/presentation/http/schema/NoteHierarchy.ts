export const NoteHierarchySchema = {
  $id: 'NoteHierarchySchema',
  properties: {
    noteId: {
      type: 'string',
      pattern: '[a-zA-Z0-9-_]+',
      maxLength: 10,
      minLength: 10,
    },
    noteTitle: {
      type: 'string',
      maxLength: 50,
    },
    childNotes: {
      type: 'array',
      items: { $ref: 'NoteHierarchySchema#' },
      nullable: true,
    },
  },
};
