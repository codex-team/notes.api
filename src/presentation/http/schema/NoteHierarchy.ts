export const NoteHierarchySchema = {
  $id: 'NoteHierarchySchema',
  properties: {
    id: {
      type: 'string',
      pattern: '[a-zA-Z0-9-_]+',
      maxLength: 10,
      minLength: 10,
    },
    content: {
      type: 'object',
      properties: {
        time: {
          type: 'number',
        },
        blocks: {
          type: 'array',
        },
        version: {
          type: 'string',
        },
      },
    },
    childNotes: {
      type: 'array',
      items: { $ref: 'NoteHierarchySchema#' },
      nullable: true,
    },
  },
};
