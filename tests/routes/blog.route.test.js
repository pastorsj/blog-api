import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';

import app from '../../src/app';
import { setupArticlesCollection, destroyArticlesCollection, articlesMock, createCounter } from '../mocks/article.mock';
import { setupUserCollection } from '../mocks/user.mock';
import acquireJwt from '../common/jwt.common';
import ImageService from '../../src/services/image.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /blog route', () => {
    let jwt = '';
    let sandbox;

    beforeEach((done) => {
        sandbox = sinon.sandbox.create();
        setupUserCollection()
            .then(() => setupArticlesCollection())
            .then(() => acquireJwt(app))
            .then((res) => {
                jwt = res.body.access_token;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
    afterEach((done) => {
        sandbox.restore();
        destroyArticlesCollection().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
    describe('/', () => {
        describe('POST', () => {
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
                        } else {
                            expect(res.body.data.title).to.be.eq('A new article on testing');
                            expect(res.body.data.text).to.be.eq('<p>A great article on testing</p>');
                            done();
                        }
                    });
            });
            it('should attempt to create a blog post but get rejected for security reasons', (done) => {
                request(app)
                    .post('/api/blog/')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        text: '<p>A great article on testing</p>',
                        title: 'A new article on testing',
                        description: 'This is a testing article',
                        author: 'newuser',
                        coverPhoto: '',
                        tags: ['redis']
                    })
                    .expect(401, done);
            });
        });
        describe('GET', () => {
            it('should retrieve all blog posts that are published', (done) => {
                request(app)
                    .get('/api/blog/')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res.body.data.length).to.be.eq(2);
                            expect(res.body.data[0].title).to.be.eq(articlesMock[0].title);
                            expect(res.body.data[1].title).to.be.eq(articlesMock[2].title);
                            done();
                        }
                    });
            });
        });
    });
    describe('/:id', () => {
        describe('GET', () => {
            it('should get a single article', (done) => {
                request(app)
                    .get('/api/blog/1')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.title).to.be.eq(articlesMock[0].title);
                            done();
                        }
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
                    .put('/api/blog/1')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        text: '<p>An updated article</p>'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.text).to.be.eq('<p>An updated article</p>');
                            done();
                        }
                    });
            });
            it('should update the datePosted field', (done) => {
                request(app)
                    .put('/api/blog/1')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        isPublished: true
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            const returnedDate = new Date(data.datePosted);
                            const originalDate = new Date(articlesMock[0].datePosted);
                            expect(returnedDate).to.be.greaterThan(originalDate);
                            done();
                        }
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
            it('should not update an article for security reasons', (done) => {
                request(app)
                    .put('/api/blog/2')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        text: '<p>Failed to update</p>'
                    })
                    .expect(401, done);
            });
        });
        describe('POST', () => {
            afterEach((done) => {
                fs.readdir('uploads', (err, files) => {
                    if (err) {
                        done(err);
                    }
                    files.forEach((file) => {
                        fs.unlinkSync(path.join('uploads', file));
                    });
                    done();
                });
            });
            it('should update/add a cover photo for an article', (done) => {
                const postImageStub = sandbox.stub(ImageService, 'postImage').resolves({ url: 'https://flickr.com' });
                request(app)
                    .post('/api/blog/1')
                    .attach('coverPhoto', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.coverPhoto).to.be.eq('https://flickr.com');
                            expect(data.author).to.be.eq('testuser');
                            postImageStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to add a cover photo since the article does not exist', (done) => {
                request(app)
                    .post('/api/blog/10')
                    .attach('coverPhoto', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(404, done);
            });
            it('should fail to add a cover photo for security reasons', (done) => {
                request(app)
                    .post('/api/blog/2')
                    .attach('coverPhoto', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(401, done);
            });
            it('should fail to add a cover photo since the service failed to post', (done) => {
                sandbox.stub(ImageService, 'postImage').rejects({ status: 400, error: 'Error' });
                request(app)
                    .post('/api/blog/1')
                    .attach('coverPhoto', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { error } = res.body;
                            expect(error).to.be.eq('Error');
                            done();
                        }
                    });
            });
            it('should return nothing when a file is not uploaded', (done) => {
                sandbox.stub(ImageService, 'postImage').rejects({ status: 400, error: 'Error' });
                request(app)
                    .post('/api/blog/1')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(204, done);
            });
            it('should not upload the image since it is greater that 1mb', (done) => {
                request(app)
                    .post('/api/blog/1')
                    .attach('coverPhoto', 'tests/common/large.jpg')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400, done);
            });
        });
        describe('DELETE', () => {
            it('should delete an article', (done) => {
                request(app)
                    .delete('/api/blog/1')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res.body.message).to.be.eq('The blog with the id 1 was removed');
                            done();
                        }
                    });
            });
            it('should fail to delete an article since it was not found', (done) => {
                request(app)
                    .delete('/api/blog/10')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(404, done);
            });
            it('should fail to delete an article for security reasons', (done) => {
                request(app)
                    .delete('/api/blog/2')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(401, done);
            });
        });
    });
    describe('/tag/:tag', () => {
        describe('GET', () => {
            it('should get all articles that are published and have a specific tag', (done) => {
                request(app)
                    .get('/api/blog/tag/redis')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.length).to.be.eq(1);
                            expect(data[0].title).to.be.eq(articlesMock[0].title);
                            done();
                        }
                    });
            });
            it('should not find any article with the given tag', (done) => {
                request(app)
                    .get('/api/blog/tag/dne')
                    .expect(404, done);
            });
        });
    });
    describe('/title/:title', () => {
        describe('GET', () => {
            it('should get all articles that are published that have part of the given title', (done) => {
                request(app)
                    .get('/api/blog/title/My')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.length).to.be.eq(1);
                            expect(data[0].title).to.be.eq(articlesMock[0].title);
                            expect(data[0].tags).to.deep.equal(articlesMock[0].tags);
                            done();
                        }
                    });
            });
            it('should fail to get any articles that are published since that title does not exist', (done) => {
                request(app)
                    .get('/api/blog/title/Testing')
                    .expect(404, done);
            });
        });
    });
});
