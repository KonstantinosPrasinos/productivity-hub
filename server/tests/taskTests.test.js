const server = require('../index');
const request = require('supertest');
const mongoose = require('mongoose');

let cookie;

jest.setTimeout(20000);

beforeAll(async () => {
    await mongoose.connect(process.env.MONG_URI);

    const response = await request(server)
        .post('/api/user/login')
        .send({email: 'konstantinos.prasinos@gmail.com', password: 'password12'});
    cookie = response.headers['set-cookie'];
})

afterAll(async() => {
    await mongoose.connection.close();
})

describe('Task Tests', () => {
    test('Get Tasks', async () => {
        await request(server)
            .get('/api/task/')
            .set('Cookie', cookie)
            .expect(200)
    })
})