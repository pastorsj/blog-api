import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';

const { expect } = chai;

describe('Test the /articles route', () => {
    const jwt = 'fake_jwt';
    describe('/articles/:username', () => {
        it('should return two articles written by testuser', (done) => {
            request(app)
                .get('/api/articles/testuser')
                .set({ Authorization: `Bearer ${jwt}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        const { data } = res.body;
                        expect(data.length).to.be.eq(2);
                        done();
                    }
                });
        });
        it('should not be able to acess any of the articles written by fake user for security reasons', (done) => {
            request(app)
                .get('/api/articles/fakeuser')
                .set({ Authorization: `Bearer ${jwt}` })
                .expect(401, done);
        });
    });
});
