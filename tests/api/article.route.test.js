import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';


import app from '../../src/app';
import { SECRET } from '../../src/config/jwt.config';
import ArticleService from '../../src/business/services/article.service';
import AuthService from '../../src/business/services/auth.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the /article route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;
    let canAccessStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        canAccessStub = sandbox.stub(AuthService, 'canAccess').returns(true);
    });
    afterEach(() => {
        canAccessStub.restore();
        sandbox.restore();
    });
    describe('/', () => {
        describe('POST', () => {
            it('should create an article and return it', (done) => {
                const articleStub = sandbox.stub(ArticleService, 'createArticle').resolves({
                    text: '<p>A great article on testing</p>',
                    title: 'A new article on testing',
                    description: 'This is a testing article',
                    author: 'testuser',
                    coverPhoto: '',
                    tags: ['redis']
                });
                request(app)
                    .post('/api/article')
                    .set({ Authorization: `Bearer ${token}` })
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

                            sinon.assert.calledWith(articleStub, {
                                text: '<p>A great article on testing</p>',
                                title: 'A new article on testing',
                                description: 'This is a testing article',
                                author: 'testuser',
                                coverPhoto: '',
                                tags: ['redis']
                            });
                            articleStub.restore();
                            done();
                        }
                    });
            });
            it('should attempt to create an article but return nothing', (done) => {
                sandbox.stub(ArticleService, 'createArticle').resolves();
                request(app)
                    .post('/api/article')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({})
                    .expect(204, done);
            });
            it('should attempt to create an article but get rejected', (done) => {
                sandbox.stub(ArticleService, 'createArticle').rejects();
                request(app)
                    .post('/api/article/')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        text: '<p>A great article on testing</p>',
                        title: 'A new article on testing',
                        description: 'This is a testing article',
                        author: 'newuser',
                        coverPhoto: '',
                        tags: ['redis']
                    })
                    .expect(404, done);
            });
        });
        describe('GET', () => {
            it('should retrieve all articles that are published', (done) => {
                const articleStub = sandbox.stub(ArticleService, 'getAllPublishedArticles').resolves([
                    {
                        title: 'Title 1',
                        text: '<p>New Article</p>',
                        author: 'testuser',
                        tags: ['redis', 'express', 'databases']
                    },
                    {
                        title: 'Title 2',
                        text: '<p>A New Article</p>',
                        author: 'testuser',
                        tags: ['redis', 'databases']
                    }
                ]);
                request(app)
                    .get('/api/article')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res.body.data.length).to.be.eq(2);
                            expect(res.body.data[0].title).to.be.eq('Title 1');
                            expect(res.body.data[1].title).to.be.eq('Title 2');

                            sinon.assert.calledOnce(articleStub);
                            articleStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to retrieve all articles', (done) => {
                sandbox.stub(ArticleService, 'getAllPublishedArticles').rejects();
                request(app)
                    .get('/api/article')
                    .expect(404, done);
            });
        });
    });
    describe('/:id', () => {
        describe('GET', () => {
            it('should get a single article', (done) => {
                const articleStub = sandbox.stub(ArticleService, 'getArticleById').resolves({
                    title: 'Title 1',
                    text: '<p>New Article</p>',
                    author: 'testuser',
                    tags: ['redis', 'express', 'databases']
                });
                request(app)
                    .get('/api/article/1')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.title).to.be.eq('Title 1');

                            sinon.assert.calledWith(articleStub, '1');
                            articleStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to return the article', (done) => {
                sandbox.stub(ArticleService, 'getArticleById').rejects();
                request(app)
                    .get('/api/article/10')
                    .expect(404, done);
            });
        });
        describe('PUT', () => {
            let canUpdate;
            beforeEach(() => {
                canUpdate = sandbox.stub(AuthService, 'canUpdate').resolves();
            });
            afterEach(() => {
                canUpdate.restore();
            });
            it('should update a single article', (done) => {
                const articleStub = sandbox.stub(ArticleService, 'updateArticle').resolves({
                    title: 'Title 1',
                    text: '<p>An updated article</p>',
                    author: 'testuser',
                    tags: ['redis', 'express', 'databases']
                });
                request(app)
                    .put('/api/article/1')
                    .set({ Authorization: `Bearer ${token}` })
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

                            sinon.assert.calledWith(articleStub, '1', {
                                text: '<p>An updated article</p>'
                            });
                            articleStub.restore();
                            done();
                        }
                    });
            });
            it('should not update an article since it was not found', (done) => {
                sandbox.stub(ArticleService, 'updateArticle').rejects();
                request(app)
                    .put('/api/article/10')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        text: '<p>Failed to update</p>'
                    })
                    .expect(404, done);
            });
        });
        describe('POST', () => {
            let canUpdate;
            beforeEach(() => {
                canUpdate = sandbox.stub(AuthService, 'canUpdate').resolves();
            });
            afterEach((done) => {
                canUpdate.restore();
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
                const postPhotoStub = sandbox.stub(ArticleService, 'postCoverPhoto').resolves({ coverPhoto: 'https://flickr.com' });
                request(app)
                    .post('/api/article/1')
                    .attach('coverPhoto', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.coverPhoto).to.be.eq('https://flickr.com');
                            postPhotoStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to add a cover photo since the article does not exist', (done) => {
                sandbox.stub(ArticleService, 'postCoverPhoto').rejects();
                request(app)
                    .post('/api/article/10')
                    .attach('coverPhoto', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(404, done);
            });
        });
        describe('DELETE', () => {
            let canUpdate;
            beforeEach(() => {
                canUpdate = sandbox.stub(AuthService, 'canUpdate').resolves();
            });
            afterEach(() => {
                canUpdate.restore();
            });
            it('should delete an article', (done) => {
                const deleteArticleStub = sandbox.stub(ArticleService, 'deleteArticle').resolves('The article with the id 1 was removed');
                request(app)
                    .delete('/api/article/1')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res.body.message).to.be.eq('The article with the id 1 was removed');

                            sinon.assert.calledWith(deleteArticleStub, '1');
                            deleteArticleStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to delete an article since it was not found', (done) => {
                sandbox.stub(ArticleService, 'deleteArticle').rejects();
                request(app)
                    .delete('/api/article/10')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(404, done);
            });
        });
    });
    describe('/tag/:tag', () => {
        describe('GET', () => {
            it('should get all articles that are published and have a specific tag', (done) => {
                const tagStub = sandbox.stub(ArticleService, 'getByTag').resolves([
                    {
                        title: 'Title 1',
                        text: '<p>New Article</p>',
                        author: 'testuser',
                        tags: ['redis', 'express', 'databases']
                    }
                ]);
                request(app)
                    .get('/api/article/tag/redis')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.length).to.be.eq(1);
                            expect(data[0].title).to.be.eq('Title 1');

                            sinon.assert.calledWith(tagStub, 'redis');
                            tagStub.restore();
                            done();
                        }
                    });
            });
            it('should not find any article with the given tag', (done) => {
                sandbox.stub(ArticleService, 'getByTag').rejects();
                request(app)
                    .get('/api/article/tag/dne')
                    .expect(404, done);
            });
        });
    });
    describe('/title/:title', () => {
        describe('GET', () => {
            it('should get all articles that are published that have part of the given title', (done) => {
                const titleStub = sandbox.stub(ArticleService, 'getByTitle').resolves([
                    {
                        title: 'My Title 1',
                        text: '<p>New Article</p>',
                        author: 'testuser',
                        tags: ['redis', 'express', 'databases']
                    }
                ]);
                request(app)
                    .get('/api/article/title/My')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.length).to.be.eq(1);
                            expect(data[0].title).to.be.eq('My Title 1');
                            expect(data[0].tags).to.deep.equal(['redis', 'express', 'databases']);

                            sinon.assert.calledWith(titleStub, 'My');
                            titleStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to get any articles that are published since that title does not exist', (done) => {
                sandbox.stub(ArticleService, 'getByTitle').rejects();
                request(app)
                    .get('/api/article/title/Testing')
                    .expect(404, done);
            });
        });
    });
    describe('/article/author/:username', () => {
        it('should return two articles written by testuser', (done) => {
            const articleServiceStub = sandbox.stub(ArticleService, 'getAllArticlesForAuthor').resolves([
                {
                    text: '<p>New Article</p>',
                    author: 'testuser',
                    tags: ['redis', 'express', 'databases']
                },
                {
                    text: '<p>A New Article</p>',
                    author: 'testuser',
                    tags: ['redis', 'databases']
                }
            ]);
            request(app)
                .get('/api/article/author/testuser')
                .set({ Authorization: `Bearer ${token}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        const { data } = res.body;
                        expect(data.length).to.be.eq(2);
                        sinon.assert.calledWith(articleServiceStub, 'testuser');
                        articleServiceStub.restore();
                        done();
                    }
                });
        });
        it('should not be able to access any of the articles written by fake user for security reasons', (done) => {
            canAccessStub.returns(false);
            request(app)
                .get('/api/article/author/fakeuser')
                .set({ Authorization: `Bearer ${token}` })
                .expect(401, done);
        });
        it('should error out when no articles are found', (done) => {
            sandbox.stub(ArticleService, 'getAllArticlesForAuthor').rejects('Error');
            request(app)
                .get('/api/article/author/testuser')
                .set({ Authorization: `Bearer ${token}` })
                .expect(404, done);
        });
    });
});
