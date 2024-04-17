export const UploadSchema = {
  $id: 'UploadSchema',
  type: 'object',
  properties: {
    key: {
      type: 'string',
      pattern: '[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+',
    },
  },
};
