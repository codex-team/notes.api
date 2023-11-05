# API testing

We use [testcontainers](https://testcontainers.com/) to run separate DB instance during API testing. Make sure you have [docker](https://www.docker.com/) installed and launched to be able to run test DB.

## Setup file
File `src/tests/utils/setup.ts` does necessary preparations to make in possible to run tests in each test file. It starts test DB, initializes API and makes it available through `global.api` in tests. File `setup.ts` also shuts down the DB after all the tests are run.

## Test data
Test data lies in `src/tests/test-data/` directory. If you are missing some data for your tests, fill free to modify existing files or add new ones. Just remember to support relations between data that is usually provided by foreign key mechanism.

## Authorization in test
Use `global.auth(id)` for getting accessToken, which you can use in:
```
headers: {
  authorization: `Bearer ${accessToken}`
}  
```
in your fake rewuests

## Writing tests
Please, locate a test file near the file that it tests. Make sure test file name is the same as tested file name, but with `.test` suffix.
API test file shoul follow such structure:
```
  describe('Module name', () => {
    describe('METHOD /path', () => {
      test('testcase #1', () => {
        // ...
      });

      test('testcase #2', () => {
        // ...
      });

      // ...
    });
  });
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
