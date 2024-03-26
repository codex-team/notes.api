import { MemberRole } from '@domain/entities/team.js';

export const memberRight = [
  /** Returns 200 if user is team member with a Write role */
  {
    testContext: {
      role: MemberRole.Write,
      isAuthorized: true,
      expectedStatusCode: 200,
    },
  },

  /** Returns 403 if user is team member with a Read role */
  {
    testContext: {
      role: MemberRole.Read,
      isAuthorized: true,
      expectedStatusCode: 403,
      expectedMessage: 'Permission denied',
    },
  },

  /** Returns 403 if user is not in the team */
  {
    testContext:{
      role: null,
      isAuthorized: true,
      expectedStatusCode: 403,
      expectedMessage: 'Permission denied',
    },
  },

  /** Returns 401 if user is not authorized */
  {
    testContext: {
      role: null,
      isAuthorized: false,
      expectedStatusCode: 401,
      expectedMessage: 'You must be authenticated to access this resource',
    },
  },
];
