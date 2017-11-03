import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import { setupArticlesCollection, destroyArticlesCollection, articlesMock, createCounter } from '../mocks/article.mock';
import { setupUserCollection } from '../mocks/user.mock';
import acquireJwt from '../common/jwt.common';

const { expect } = chai;

describe('Test the /blog route', () => {
    let jwt = '';
    before((done) => {
        createCounter(done).then(() => {
            setupUserCollection((error) => {
                if (error) {
                    done(error);
                }
                setupArticlesCollection(done);
            });
        }).catch((err) => {
            done(err);
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
                        return done(err);
                    }
                    expect(res.body.data.title).to.be.eq('A new article on testing');
                    expect(res.body.message).to.be.eq('Blog created by testuser');
                    return done();
                });
        });
        it('should retrieve all blog posts that are published', (done) => {
            request(app)
                .get('/api/blog/')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body.data.length).to.be.eq(2);
                    expect(res.body.data[0].title).to.be.eq(articlesMock[0].title);
                    expect(res.body.data[1].title).to.be.eq(articlesMock[2].title);
                    return done();
                });
        });
    });
    describe('/:id', () => {
        describe('GET', () => {
            it('should get a single article', (done) => {
                request(app)
                    .get('/api/blog/0')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.data.title).to.be.eq(articlesMock[0].title);
                        return done();
                    });
            });
            it('should fail to return the article', (done) => {
                request(app)
                    .get('/api/blog/10')
                    .expect(404, done);
            });
        });
        describe('PUT', () => {
            it('should update a single article', (done) => {
                request(app)
                    .put('/api/blog/0')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        text: '<p>An updated article</p>'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.data.text).to.be.eq('<p>An updated article</p>');
                        return done();
                    });
            });
            it('should update the datePosted field', (done) => {
                request(app)
                    .put('/api/blog/0')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        isPublished: true
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        const returnedDate = new Date(res.body.data.datePosted);
                        const originalDate = new Date(articlesMock[0].datePosted);
                        expect(returnedDate).to.be.greaterThan(originalDate);
                        return done();
                    });
            });
            it('should not update an article since it was not found', (done) => {
                request(app)
                    .put('/api/blog/10')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        text: '<p>Failed to update</p>'
                    })
                    .expect(404, done);
            });
        });
    });
});
