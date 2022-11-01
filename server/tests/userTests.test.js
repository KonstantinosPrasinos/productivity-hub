const server = require('../server');
const request = require('supertest');
const User = require("../models/userSchema");
const Settings = require('../models/settingsSchema');
const mongoose = require('mongoose')

describe('Test User', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Login Success', async () => {
        await request(server)
            .post('/api/user/login')
            .send({email: 'temp@email.com', password: 'asdfafasd'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(expect.objectContaining({user: {
                                __v: expect.any(Number),
                                _id: expect.any(String),
                                local: expect.objectContaining({email: 'temp@email.com'})
                            }}));
            })
    })

    test('Login Failure', async () => {
        await request(server)
            .post('/api/user/login')
            .send({email: 'temp@email.com', password: ''})
            .expect(400)
    })

    test('Register Success', async () => {
        const a = await User.findOneAndDelete({'local.email': 'temp@email.com'});
        if (a) {
            await Settings.findOneAndDelete({'userId': a._id});
        }

        await request(server)
            .post('/api/user/signup')
            .send({email: 'temp@email.com', password: 'asdfafasd'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(expect.objectContaining({user: {
                        __v: expect.any(Number),
                        _id: expect.any(String),
                        local: expect.objectContaining({email: 'temp@email.com'}),
                    }}));
            })
    })

    test('Register Failure (User already exists)' , async () => {
        await request(server)
            .post('/api/user/signup')
            .send({email: 'temp@email.com', password: 'asdfafasd'})
            .expect(409)
            .then(response => {
                expect(response.body).toEqual({error: 'User already exists.'});
            })
    })

    test('Register Failure (Invalid credentials)', async () => {
        await request(server)
            .post('/api/user/signup')
            .expect(400)
            .then(response => {
                expect(response.body).toEqual({error: 'All fields must be filled.'});
            })
    })

    test('Delete User Success', async () => {
        let cookie;

        // Register user
        await request(server)
            .post('/api/user/signup')
            .send({email: 'temp2@email.com', password: 'asdfafasd'})

        // Log in as user
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'temp2@email.com', password: 'asdfafasd'});


        // Get session cookie for next request
        cookie = response.headers['set-cookie'];

        // Delete user
        await request(server)
            .post('/api/user/delete')
            .set('Cookie', cookie)
            .send({email: 'temp2@email.com', password: 'asdfafasd'})
            .expect(200)
            .then(async () => {
                // Attempt to log in again but fail to
                await request(server)
                    .post('/api/user/login')
                    .send({email: 'temp2@email.com', password: 'asdfafasd'})
                    .then(promise => {
                        console.log(promise.statusCode, promise.body)
                    })
            })

    })
})