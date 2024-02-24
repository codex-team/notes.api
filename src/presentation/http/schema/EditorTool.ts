export const EditorToolSchema = {
  $id: 'EditorToolSchema',
  type: 'object',
  required: [
    'name',
    'title',
    'exportName',
    'source',
  ],
  properties: {
    id: {
      type: 'string',
      readOnly: true,
      description: 'Unique tool id',
    },
    name: {
      type: 'string',
      description: 'Plugin id that editor will use, e.g. "warning", "list", "linkTool"',
    },
    title: {
      type: 'string',
      description: 'User-friendly name that will be shown in marketplace, .e.g "Warning tool 3000"',
    },
    exportName: {
      type: 'string',
      description: 'Name of the plugin\'s class, e.g. "LinkTool", "Checklist", "Header"',
    },
    isDefault: {
      type: 'boolean',
      description: 'Is plugin included by default in the editor',
      default: false,
    },
    source: {
      type: 'object',
      properties: {
        cdn: {
          type: 'string',
          description: 'Tool URL in content delivery network',
        },
      },
    },
  },
};

