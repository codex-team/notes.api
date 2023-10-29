import { describe, test, expect } from 'vitest'
describe('Note API', () => {
    describe('POST /auth/:', () => {
        test('Returns 401 when session is not valid', async () => {
            const expectedStatus = 401

            const response = await global.api?.fakeRequest({
                method: 'POST',
                url: '/auth/' // write not authorised data
            })

            expect(response?.statusCode).toBe(expectedStatus)

            const body = response?.body !== undefined ? JSON.parse(response?.body) : {}

            expect(body).toStrictEqual({ message: "Session is not valid" })
        })
        test('Returns 200 when session was authed', async () => {

            const expectedStatus = 200

            const expectedAuthReply = {
                accessToken: '',
                refreshToken: ''
            };

            const response = await global.api?.fakeRequest({
                method: 'POST',
                url: ""//write authorised data
            })

            expect(response?.statusCode).toBe(expectedStatus)

            const body = response?.body !== undefined ? JSON.parse(response?.body) : {}

            expect(body).toStrictEqual(expectedAuthReply)

        })
    })
})