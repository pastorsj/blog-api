import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';

const { expect } = chai;

describe('Test the /gist route', () => {
    let jwt = '';

    beforeEach((done) => {
        acquireJwt(app).then((res) => {
            jwt = res.body.access_token;
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
                        link: 'https://github.com/pastorsj/blog-api/blob/master/tests/routes/gist.route.test.js'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data).to.have.all.keys('file', 'styles', 'html');
                            done();
                        }
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
