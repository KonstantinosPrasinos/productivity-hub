const server = require('../server');
const request = require('supertest');
const mongoose = require('mongoose');

jest.setTimeout(100 * 1000)

describe('Task History Tests', () => {
    afterAll(() => {
        mongoose.connection.close();
    })

    test('Add task entry', async () => {
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'password1234'});

        const cookie = response.headers['set-cookie'];

        await request(server)
            .post('/api/entry/')
            .set('Cookie', cookie)
            .send({entry: {taskId: '636d24552c9b7b529b0a6d8c', value: '1'}})
            .expect(200)
    })

    test('Get recent entries', async () => {
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'password1234'});

        const cookie = response.headers['set-cookie'];

        await request(server)
            .get('/api/entry/recent')
            .set('Cookie', cookie)
            .send({taskId: '636d24552c9b7b529b0a6d8c'})
            .expect(200)
            .then(finalResponse => {
                expect(finalResponse.body).toEqual(expect.objectContaining({
                    entries: expect.any(Array)
                }));
            })

    })
})