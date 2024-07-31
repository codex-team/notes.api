/**
 * Note history record shema used for validation and serialization
 */
export const HistotyRecordShema = {
  $id: 'NoteHistorySchema',
  type: 'object',
  required: [
    'content',
    'id',
    'userId',
    'createdAt',
    'tools',
    'user',
  ],
  properties: {
    id: {
      description: 'unique note hisotry record identifier',
      type: 'number',
    },
    noteId: {
      description: 'unique note identifier',
      type: 'string',
    },
    userId: {
      description: 'unique user identifier',
      type: 'number',
    },
    createdAt: {
      description: 'time, when note history record was created',
      type: 'string',
      format: 'date-time',
    },
    user: {
      type: 'object',
      properties: {
        name: {
          description: 'name of the user',
          type: 'string',
        },
        photo: {
          description: 'photo of the user',
          type: 'string',
        },
      },
    },
    content: {
      description: 'content of certain version of the note',
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
    tools: {
      description: 'list of editor tools objects "toolName": "toolId" for content displaying',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
      },
    },
  },
};

export const HistoryMetaSchema = {
  $id: 'HistoryMetaSchema',
  type: 'object',
  required: [
    'id',
    'userId',
    'createdAt',
    'user',
  ],
  properties: {
    id: {
      description: 'unique note hisotry record identifier',
      type: 'number',
    },
    userId: {
      description: 'unique user identifier',
      type: 'number',
    },
    createdAt: {
      description: 'time, when note history record was created',
      type: 'string',
      format: 'date-time',
    },
    user: {
      type: 'object',
      properties: {
        name: {
          description: 'name of the user',
          type: 'string',
        },
        photo: {
          description: 'photo of the user',
          type: 'string',
        },
      },
    },
  },
};
