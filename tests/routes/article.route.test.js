import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import { setupArticlesCollection, destroyArticlesCollection } from '../mocks/article.mock';
import { setupUserCollection } from '../mocks/user.mock';
import acquireJwt from '../common/jwt.common';

const { expect } = chai;

describe('Test the /articles route', () => {
    let jwt = '';
    before((done) => {
        setupUserCollection((err) => {
            if (err) {
                done(err);
            }
            setupArticlesCollection(done);
        });
    });
    beforeEach((done) => {
        acquireJwt(app).then((res) => {
            jwt = res.body.token;
            done();
        }).catch((err) => {
            done(err);
        });
    });
    after((done) => {
        destroyArticlesCollection(done);
    });
    describe('/articles/:username', () => {
        it('should return two articles written by testuser', (done) => {
            request(app)
                .get('/api/articles/testuser')
                .set({ Authorization: `Bearer ${jwt}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res.body.data.length).to.be.eq(2);
                    done();
                });
        });
        it('should return no articles written by the fakeuser', (done) => {
            request(app)
                .get('/api/articles/fakeuser')
                .set({ Authorization: `Bearer ${jwt}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res.body.data.length).to.be.eq(0);
                    done();
                });
        });
    });
});
