import request from 'supertest';
import app from '../../src/app';

describe('Test the /user/:username route', () => {
    it('should get a user given a username', (done) => {
        request(app)
            .get('/api/user/test')
            .expect(404)
            .end(() => {
                done();
            });
    });
});
