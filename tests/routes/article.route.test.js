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
        setupUserCollection()
            .then(() => setupArticlesCollection())
            .then(() => acquireJwt(app))
            .then((res) => {
                jwt = res.body.token;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
    after((done) => {
        destroyArticlesCollection().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
    describe('/articles/:username', () => {
        it('should return two articles written by testuser', (done) => {
            request(app)
                .get('/api/articles/testuser')
                .set({ Authorization: `Bearer ${jwt}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    const { data } = res.body;
                    expect(data.length).to.be.eq(2);
                    return done();
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
