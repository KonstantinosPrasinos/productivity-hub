const server = require('../server');
const request = require('supertest');
const User = require("../models/userSchema");
const Settings = require('../models/settingsSchema');
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");

jest.setTimeout(20000);

describe('Test User', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONG_URI)
    })

    afterAll(async() => {
        await mongoose.connection.close();
    })

    test('Login Success', async () => {
        await request(server)
            .post('/api/user/login')
            .send({email: 'test@email.com', password: 'testpassword'})
            .expect(200)
            .then(response => {
                expect(response.body).toMatchObject({user: {
                        // __v: expect.any(Number),
                        // _id: expect.any(String),
                        local: {email: 'test@email.com'}
                        // createdAt: expect.any(Date),
                        // updatedAt: expect.any(Date),
                        // active: expect.any(Boolean)
                    }});
            })
    })

    test('Login Failure', async () => {
        await request(server)
            .post('/api/user/login')
            .send({email: 'user1@email.com', password: ''})
            .expect(400)
    })

    test('Register Success', async () => {
        const a = await User.findOneAndDelete({'local.email': 'userRegister@email.com'});
        if (a) {
            await Settings.findOneAndDelete({'userId': a._id});
        }

        await request(server)
            .post('/api/user/signup')
            .send({email: 'userRegister@email.com', password: 'password'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(expect.objectContaining({user: {
                        __v: expect.any(Number),
                        _id: expect.any(String),
                        local: expect.objectContaining({email: 'userRegister@email.com'}),
                    }}));
            })
    })

    test('Register Failure (User already exists)' , async () => {
        await request(server)
            .post('/api/user/signup')
            .send({email: 'userRegister@email.com', password: 'password'})
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
            .send({email: 'userDelete@email.com', password: 'password'})

        // Log in as user
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'userDelete@email.com', password: 'password'});


        // Get session cookie for next request
        cookie = response.headers['set-cookie'];

        // Delete user
        await request(server)
            .post('/api/user/delete')
            .set('Cookie', cookie)
            .send({email: 'userDelete@email.com', password: 'password'})
            .expect(200)
            .then(async () => {
                // Attempt to log in again but fail to
                await request(server)
                    .post('/api/user/login')
                    .send({email: 'userDelete@email.com', password: 'password'})
                    .expect(401)
            })

    })

    test('Change User Password', async () => {
        // Log in as user
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'user2@email.com', password: 'password'});

        // Get session cookie for next request
        const id = response.body.user._id;
        const cookie = response.headers['set-cookie'];

        // Change password to password 2
        await request(server)
            .post('/api/user/change-password')
            .set('Cookie', cookie)
            .send({password: 'password', newPassword: 'password2'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual({message: 'Password changed successfully.'});
            })

        // Re hash password
        const hashedPassword = bcrypt.hashSync('password', 10)

        // Reset password to password hashed above
        const user = await User.findByIdAndUpdate(id, {$set: {'local.password': hashedPassword}});

        expect(bcrypt.compareSync('password2', user.local.password)).toBe(true);
    })

    test('Change User Email', async () => {
        // Log in as user
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'user2@email.com', password: 'password'})
            .expect(200);

        // Get session cookie for next request
        const id = response.body.user._id;
        const cookie = response.headers['set-cookie'];

        // Change email to user2Changed
        await request(server)
            .post('/api/user/change-email')
            .set('Cookie', cookie)
            .send({email: 'user2@email.com', password: 'password', newEmail: 'user2Changed@email.com'})
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(expect.objectContaining({user: {
                        __v: expect.any(Number),
                        _id: expect.any(String),
                        local: expect.objectContaining({email: 'user2Changed@email.com'}),
                    }}));
            })

        // Reset email to user2
        const user = await User.findByIdAndUpdate(id, {$set: {'local.email': 'user2@email.com'}});

        // Take the response from the query (which is the user before the change) and make sure the email was changed properly
        expect(user.local.email).toBe('user2Changed@email.com');
    })
})