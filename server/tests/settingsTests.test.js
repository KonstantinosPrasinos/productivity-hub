const request = require("supertest");
const server = require("../server");
const mongoose = require('mongoose')

jest.setTimeout(10 * 1000)

describe('Settings Tests', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Get Settings Success', async () => {
        let cookie;

        // log in
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'temp@email.com', password: 'asdfafasd'});

        const userId = response.body.user._id;
        cookie = response.headers['set-cookie'];

        await request(server)
            .get('/api/settings')
            .set('Cookie', cookie)
            .expect(200)
            .then(finalResponse => {
                expect(finalResponse.body).toEqual(expect.objectContaining({
                    __v: expect.any(Number),
                    _id: expect.any(String),
                    defaults: expect.objectContaining({step: 1, goal: 1, priority: 1}),
                    theme: expect.stringMatching('Light'),
                    userId: expect.stringMatching(userId)
                }));
            })
    })

    test('Get Settings Failure', async () => {
        await request(server)
            .get('/api/settings')
            .expect(401)
            .then(response => {
                expect(response.body).toEqual({message: 'Not authorized'});
            })
    })
})