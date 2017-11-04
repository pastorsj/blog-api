import request from 'supertest';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';

describe('Test the /jwt route', () => {
    let jwt = '';

    beforeEach((done) => {
        acquireJwt(app).then((res) => {
            jwt = res.body.token;
            done();
        }).catch((err) => {
            done(err);
        });
    });
    describe('/expired', () => {
        describe('POST', () => {
            it('should return that the jwt is valid', (done) => {
                request(app)
                    .post('/api/jwt/expired')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(204, done);
            });
            it('should return that the jwt is invalid', (done) => {
                request(app)
                    .post('/api/jwt/expired')
                    .set({ Authorization: `Bearer ${jwt}1` })
                    .expect(401, done);
            });
            it('should return that the jwt is invalid since the authorization header was not included', (done) => {
                request(app)
                    .post('/api/jwt/expired')
                    .expect(401, done);
            });
            it('should return that the jwt is malformed since it did not start with Bearer', (done) => {
                request(app)
                    .post('/api/jwt/expired')
                    .set({ Authorization: `${jwt}1` })
                    .expect(400, done);
            });
        });
    });
});
