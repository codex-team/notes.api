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
  ],
  properties: {
  },
};
