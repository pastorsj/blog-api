import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import { setupArticlesCollection, destroyArticlesCollection, articlesMock } from '../mocks/article.mock';
import { setupUserCollection } from '../mocks/user.mock';
import acquireJwt from '../common/jwt.common';

const { expect } = chai;

describe('Test the /blog route', () => {
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
    describe('/', () => {
        it('should create an blog post and return it', (done) => {
            request(app)
                .post('/api/blog/')
                .set({ Authorization: `Bearer ${jwt}` })
                .send({
                    text: '<p>A great article on testing</p>',
                    title: 'A new article on testing',
                    description: 'This is a testing article',
                    author: 'testuser',
                    coverPhoto: '',
                    tags: ['redis']
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res.body.data.title).to.be.eq('A new article on testing');
                    expect(res.body.message).to.be.eq('Blog created by testuser');
                    done();
                });
        });
        it('should retrieve all blog posts that are published', (done) => {
            request(app)
                .get('/api/blog/')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    expect(res.body.data.length).to.be.eq(2);
                    expect(res.body.data[0].title).to.be.eq(articlesMock[0].title);
                    expect(res.body.data[1].title).to.be.eq(articlesMock[2].title);
                    done();
                });
        });
    });
});
