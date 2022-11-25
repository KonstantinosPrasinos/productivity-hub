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
            .post('/api/entries/')
            .set('Cookie', cookie)
            .send({entry: {taskId: '63692d3d3e3f0b32f674ea6a', value: '1'}})
            .expect(200)
    })

    test('Get recent entries', async () => {
        const response = await request(server)
            .post('/api/user/login')
            .send({email: 'konstantinos.prasinos@gmail.com', password: 'password1234'});

        const cookie = response.headers['set-cookie'];

        await request(server)
            .get('/api/entries/recent')
            .set('Cookie', cookie)
            .send({taskId: '63692d3d3e3f0b32f674ea6a'})
            .expect(200)
            .then(finalResponse => {
                expect(finalResponse.body).toEqual(expect.objectContaining({
                    entries: expect.any(Array)
                }));
            })

    })
})