const request = require("supertest");
const server = require("../server");
const mongoose = require('mongoose')

jest.setTimeout(10 * 1000)

describe('Settings Tests', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Get Settings Success', async () => {
        // log in
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'settings@email.com', password: 'password'});

        const userId = response.body.user._id;
        const cookie = response.headers['set-cookie'];

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

    test('Set Settings success', async () => {
        // log in
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'settings@email.com', password: 'password'});

        const userId = response.body.user._id;
        const cookie = response.headers['set-cookie'];

        await request(server)
            .post('/api/settings/update')
            .set('Cookie', cookie)
            .send({theme: 'Dark', defaults: {step: 10}})
            .expect(200)
            .then(finalResponse => {
                expect(finalResponse.body.settings).toEqual(expect.objectContaining({
                    __v: expect.any(Number),
                    _id: expect.any(String),
                    defaults: expect.objectContaining({goal: 1, priority: 1, step: 10}),
                    theme: expect.stringMatching('Dark'),
                    userId: expect.stringMatching(userId)
                }));
            })
    })
})