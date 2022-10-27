const server = require('../server');
const request = require('supertest');
const User = require("../models/userSchema");

describe('Test User', () => {
    test('Test Login', async () => {
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'asdfafasd'})

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({user: {
                __v: expect.any(Number),
                _id: expect.any(String),
                local: expect.objectContaining({email: 'konstantinos.prasinos@gmail.com'}),
                settings: expect.objectContaining({ defaults: { step: 1, goal: 1, priority: 1 }, theme: 'Light' })
            }}));
    })

    test('Test Register', async () => {
        await User.findOneAndRemove({'local.email': 'konstantinos.prasinos@gmail.com'});
        const response = await request(server)
            .post('/api/user/signup')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'asdfafasd'})

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({user: {
                __v: expect.any(Number),
                _id: expect.any(String),
                local: expect.objectContaining({email: 'konstantinos.prasinos@gmail.com'}),
                settings: expect.objectContaining({ defaults: { step: 1, goal: 1, priority: 1 }, theme: 'Light' })
            }}));
    })
})