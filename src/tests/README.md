# API testing

We use [testcontainers](https://testcontainers.com/) to run separate DB instance duting API testing. Make sure you have [docker](https://www.docker.com/) installed and launched to be able to run test DB.

## Setup file
File `src/tests/utils/setup.ts` does necessary preparations to make in possible to run tests in each test file. It starts test DB, initializes API and makes it available through `global.api` in tests. File `setup.ts` also shuts down the DB after all the tests are run.

## Test data
Test data lie in `src/tests/test-data/` directory. If you are missing some data for your tests, fill free to modify existing files or add new ones. Just remember to support relations between data that is usually provided by foreign key mechanism.

## Writing tests
Please, locate a test file near the file that it tests. Make sure test file name is the same as tested file name, but with `.test` suffix.
API test file shoul follow such structure:
```
  describe('Module name', () => {
    describe('API method desription', () => {
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

Test cases should be grouped by API method description, API method descriptions should be grouped by modules descriptions.
Each module should have it's own test file.

Also consider using [AAA pattern](https://medium.com/@pjbgf/title-testing-code-ocd-and-the-aaa-pattern-df453975ab80) for organizing your tests.

See `src/presentation/http/router/note.test.ts` for example

## Running tests

- Execute all the tests:

  ``` 
  yarn test 
  ```

- Execute all tests in verbose mode with testcontainers logs:
  ``` 
  yarn test:verbose 
  ```

- Execute specific tests
  ```
  yarn test note
  ```
  This command will execute only test files which have names starting with 'note'.
