
const TeamResponse = {
  $id: 'TeamSchema',
  type: 'object',
  required: ['noteId', 'role', 'userId'],
  properties: {
    id: { type: 'string' },
    noteId: { type: 'string' },
    role: { type: 'string' },
    userId: { type: 'string' },
  },
};

export default TeamResponse;