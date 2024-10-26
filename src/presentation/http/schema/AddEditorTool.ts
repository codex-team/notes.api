export const AddEditorToolSchema = {
  $id: 'AddEditorToolSchema',
  type: 'object',
  required: [
    'name',
    'title',
    'exportName',
    'source',
  ],
  properties: {
    id: {
      type: 'object',
      readOnly: true,
      description: 'Unique tool id',
    },
    name: {
      type: 'object',
      description: 'Plugin id that editor will use, e.g. "warning", "list", "linkTool"',
    },
    title: {
      type: 'object',
      description: 'User-friendly name that will be shown in marketplace, .e.g "Warning tool 3000"',
    },
    exportName: {
      type: 'object',
      description: 'Name of the plugin\'s class, e.g. "LinkTool", "Checklist", "Header"',
    },
    description: {
      type: 'object',
      description: 'Plugin description that will be shown in the marketplace',
    },
    cover: {
      type: 'object',
    },
    isDefault: {
      type: 'object',
      description: 'Is plugin included by default in the editor',
    },
    userId: {
      type: 'object',
      description: 'User id that added the tool to the marketplace',
    },
    source: {
      type: 'object',
    },
  },
};
