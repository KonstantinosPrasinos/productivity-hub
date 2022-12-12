const server = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');


describe('Task Tests', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Get Tasks', async () => {
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'password1234'});

        const cookie = response.headers['set-cookie'];

        await request(server)
            .get('/api/task/')
            .set('Cookie', cookie)
            .expect(200)
    })
})