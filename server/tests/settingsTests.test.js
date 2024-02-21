const request = require("supertest");
const server = require("../index");
const mongoose = require('mongoose')
const Settings = require('../models/settingsSchema');

jest.setTimeout(10 * 1000)

describe('Settings Tests', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Get Settings Success', async () => {
        // log in
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'password1234'});

        const cookie = response.headers['set-cookie'];

        await request(server)
            .get('/api/settings')
            .set('Cookie', cookie)
            .expect(200)
            .then(finalResponse => {
                expect(finalResponse.body).toEqual(expect.objectContaining({
                    defaults: expect.objectContaining({step: 1, goal: 1, priority: 1}),
                    theme: expect.stringMatching('Light')
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
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'password1234'});

        const userId = response.body.user._id;
        const cookie = response.headers['set-cookie'];

        await request(server)
            .post('/api/settings/update')
            .set('Cookie', cookie)
            .send({settings: {theme: 'Dark', defaults: {goal: 1, priority: 1, step: 10}}})
            .expect(200)
            .then(finalResponse => {
                expect(finalResponse.body).toEqual(expect.objectContaining({
                    defaults: expect.objectContaining({goal: 1, priority: 1, step: 10}),
                    theme: expect.stringMatching('Dark')
                }));
            })

        await Settings.findOneAndUpdate({userId: userId}, {$set: {'theme': 'Light', 'defaults': {goal: 1, priority: 1, step: 1}}});
    })
})