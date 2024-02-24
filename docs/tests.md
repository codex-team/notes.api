# API testing

We use [testcontainers](https://testcontainers.com/) to run separate DB instance during API testing. Make sure you have [docker](https://www.docker.com/) installed and launched to be able to run test DB.

## Setup file
File `src/tests/utils/setup.ts` does necessary preparations to make it possible to run tests in each test file. It starts test DB, initializes API and makes it available through `global.api` in tests. File `setup.ts` also shuts down the DB after all the tests are run.

## Authorization in test
Use `global.auth(userId)` for getting accessToken, which you can use in:
```
headers: {
  authorization: `Bearer ${accessToken}`
}  
```
in your fake requests

## Writing tests, AAA model
<span style="color: rgba(0, 0, 0, 0.2);">all tests must be written according to the AAA model</span>.

## Arrange
In this block of code environment should be prepared for following tests

### Examples
- Truncate all tables
```
await global.db.truncateTables();
```

- Insert some data to tables
```
/** create test user */
const user = await global.db.insertUser({
  email: 'testemal@CodeXmail.com',
  name: 'CodeX',
});

/** create test note for created user */
const note = await global.db.insertNote({
  creatorId: user.userId,
  publicId: 'Pq1T9vc23Q',
});
```

- Prepare access tokens
```
const accessToken = global.auth(user.userId);
```

## Act
`global.api?.fakeRequest()` method should be used to execute request.

### Example
- PATCH request, that updates team member role
``` 
const response = await global.api?.fakeRequest({
  method: 'PATCH',
  headers: {
    authorization: `Bearer ${accessToken}`,
  },
  url: '/note-settings/Pq1T9vc23Q/team',
  body: {
    userId: user.userId,
    newRole: 1,
  },
});
```
You should use data that you already prepared in **Arrange** block, such as *accessToken* in example.

## Assert
In this block of code the actual behavior of the request is compared with the expected behavior.
*expect()* method from [*vitest*](https://vitest.dev/guide/) should be used to compare.

### Examples
- Expect parsed response to strictly equal expected response
```
expect(response?.json()).toStrictEqual({
  'customHostname': 'codex.so',
  'id': 54,
  'invitationHash': 'FfAwyaR80C',
  'isPublic': true,
  'noteId': 54,
  'team':  [],
});
```
**Do not use variables (expectedResponse, expectedNote, etc) to store expected data** 

- Expect status code of the response to be equal to expected one
```
expect(response?.statusCode).toBe(200);
```

Test cases should be grouped by API methods, API methods should be grouped by modules.
Each module should have it's own test file.

Also consider using [AAA pattern](https://medium.com/@pjbgf/title-testing-code-ocd-and-the-aaa-pattern-df453975ab80) for organizing your tests.

See `src/presentation/http/router/note.test.ts` for example

## Running tests
- Perform a single tests run without watch mode:
  ```
  yarn test
  ```

- Execute all the tests and enter watch mode to track file changes and re-execute tests:

  ```
  yarn test:dev
  ```

- Execute all tests in verbose mode:
  ```
  DEBUG=testcontainers* yarn test
  ```
  Use this command for troubleshooting test DB. It will output all testcontainers logs.
- Execute specific tests
  ```
  yarn test note
  ```
  This command will execute only test files which have names starting with 'note'.


## Troubleshooting
- `Error: Could not find a working container runtime strategy`

  This error occurs when docker is not running on your machine. Please, install and launch docker.