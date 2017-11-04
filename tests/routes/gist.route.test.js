import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';

const { expect } = chai;

describe('Test the /gist route', () => {
    let jwt = '';

    beforeEach((done) => {
        acquireJwt(app).then((res) => {
            jwt = res.body.token;
            done();
        }).catch((err) => {
            done(err);
        });
    });
    describe('/', () => {
        describe('POST', () => {
            it('should return successfully', (done) => {
                request(app)
                    .post('/api/gist')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        link: 'https://github.com/pastorsj/blog-api/blob/master/index.html'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.data).to.have.all.keys('file', 'styles', 'html');
                        return done();
                    });
            });
            it('should error out when no link is provided', (done) => {
                request(app)
                    .post('/api/gist')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400, done);
            });
        });
    });
});
