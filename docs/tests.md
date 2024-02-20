# AAA model
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
const accessToken = global.auth(userId);
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
**Do not use expectedResponse, expectedNote etc variables to store expected data** 

- Expect status code of the response to be equal to expected one
```
expect(response?.statusCode).toBe(200);
```