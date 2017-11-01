import request from 'supertest';

export default function acquireJwt(app) {
    return request(app)
        .get('/api/login')
        .set({ Authorization: 'testuser:test' });
}
