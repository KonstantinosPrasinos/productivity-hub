const server = require('../server');
const request = require('supertest');
const User = require("../models/userSchema");
const mongoose = require('mongoose')

describe('Test User', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Login Success', async () => {
        await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'asdfafasd'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(expect.objectContaining({user: {
                                __v: expect.any(Number),
                                _id: expect.any(String),
                                local: expect.objectContaining({email: 'konstantinos.prasinos@gmail.com'})
                            }}));
            })
    })

    test('Login Failure', async () => {
        await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: ''})
            .expect(400)
    })

    test('Register Success', async () => {
        await User.findOneAndRemove({'local.email': 'konstantinos.prasinos@gmail.com'});

        await request(server)
            .post('/api/user/signup')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'asdfafasd'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(expect.objectContaining({user: {
                                __v: expect.any(Number),
                                _id: expect.any(String),
                                local: expect.objectContaining({email: 'konstantinos.prasinos@gmail.com'}),
                            }}));
            })
    })

    test('Register Failure (User already exists)' , async () => {
        await request(server)
            .post('/api/user/signup')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'asdfafasd'})
            .expect(409)
            .then(response => {
                expect(response.body).toEqual({error: 'User already exists'});
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
})