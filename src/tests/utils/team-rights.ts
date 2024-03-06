import { MemberRole } from '@domain/entities/team.js';

export let memberRightsTestData: any[] = [
  /** Returns 200 if user is team member with a Write role */
  {
    role: MemberRole.Write,
    isAuthorized: true,
    expectedStatusCode: 200,
  },

  /** Returns 403 if user is team member with a Read role */
  {
    role: MemberRole.Read,
    isAuthorized: true,
    expectedStatusCode: 403,
    expectedMessage: 'Permission denied',
  },

  /** Returns 403 if user is not in the team */
  {
    role: null,
    isAuthorized: true,
    expectedStatusCode: 403,
    expectedMessage: 'Permission denied',
  },

  /** Returns 401 if user is not authorized */
  {
    role: null,
    isAuthorized: false,
    expectedStatusCode: 401,
    expectedMessage: 'You must be authenticated to access this resource',
  },
];
