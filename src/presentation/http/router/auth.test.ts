import { describe, test, expect } from 'vitest'
describe('Note API', () => {
    describe('POST /auth', () => {
        test('Returns 401 when session is not valid', async () => {
            const expectedStatus = 401

            const response = await global.api?.fakeRequest({
                method: 'POST',
                url: '/auth' // write not authorised data
            })

            expect(response?.statusCode).toBe(expectedStatus)

            const body = response?.body !== undefined ? JSON.parse(response?.body) : {}

            expect(body).toStrictEqual({ message: "Session is not valid" })
        })
        test('Returns 200 when session was authorized', async () => {

            const expectedStatus = 200

            const expectedAuthReply = {
                refreshToken: "pv-jIqfPj1",
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTksImlhdCI6MTY5ODc1NzQyMSwiZXhwIjoxNjk5NjU3NDIxfQ.g0PzlWpGkw4VQrMRulNrnnAFa3KxtF4buCjqxKV-wq4"
            
            };

            const response = await global.api?.fakeRequest({
                method: 'POST',
                url: "/auth"//write authorised data
            })

            expect(response?.statusCode).toBe(expectedStatus)

            const body = response?.body !== undefined ? JSON.parse(response?.body) : {}

            expect(body).toStrictEqual(expectedAuthReply)

        })
    })
})