import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import ArticleRepository from '../../src/dal/repositories/article.repository';
import ArticleService from '../../src/business/services/article.service';
import UserService from '../../src/business/services/user.service';
import ImagesService from '../../src/business/services/image.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the Article Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('getAllArticlesForAuthor', () => {
        it('should get all articles from the article repository', () => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').returns(['article1', 'article2']);
            const articles = ArticleService.getAllArticlesForAuthor('testuser');
            expect(articles.length).to.be.eq(2);

            sinon.assert.calledWith(articleRepoStub, {
                author: 'testuser'
            });
            articleRepoStub.restore();
        });
    });
    describe('getAllArticles', () => {
        it('should retrieve all articles with author information attached', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves(['article1', 'article2']);
            const retrieveAuthorStub = sandbox.stub(UserService, 'retrieveAuthor').resolves({ text: 'article', author: { username: 'test' } });
            ArticleService.getAllArticles().then((articles) => {
                expect(articles.length).to.be.eq(2);

                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, { __v: 0 });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledTwice(retrieveAuthorStub);
                articleRepoStub.restore();
                retrieveAuthorStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to get all articles', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').rejects();
            ArticleService.getAllArticles().then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, { __v: 0 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
    });
    describe('getArticleById', () => {
        it('should get an article by its id', () => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').returns({ text: '<p>Test article</p>' });
            const article = ArticleService.getArticleById(1);
            expect(article.text).to.be.eq('<p>Test article</p>');

            sinon.assert.calledWith(articleRepoStub, { _id: 1 });
            sinon.assert.calledOnce(articleRepoStub);
            articleRepoStub.restore();
        });
    });
    describe('getByTag', () => {
        it('should all articles with a tag', () => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').returns(['article1', 'article2']);
            const articles = ArticleService.getByTag('redis');
            expect(articles.length).to.be.eq(2);

            sinon.assert.calledWith(articleRepoStub, {
                tags: 'redis',
                isPublished: true
            });
            sinon.assert.calledOnce(articleRepoStub);
            articleRepoStub.restore();
        });
    });
    describe('getByTitle', () => {
        it('should all articles by title', () => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').returns(['article1', 'article2']);
            const articles = ArticleService.getByTitle('title');
            expect(articles.length).to.be.eq(2);

            sinon.assert.calledWith(articleRepoStub, {
                title: {
                    $regex: '^title',
                    $options: 'i'
                },
                isPublished: true
            }, {
                _id: 1,
                title: 1,
                tags: 1
            });
            sinon.assert.calledOnce(articleRepoStub);
            articleRepoStub.restore();
        });
    });
    describe('createArticle', () => {
        it('should create an article', () => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'create').returns({ text: '<p>Test article</p>' });
            const article = ArticleService.createArticle({ text: '<p>Test article</p>' });
            expect(article.text).to.be.eq('<p>Test article</p>');

            sinon.assert.calledWith(articleRepoStub, { text: '<p>Test article</p>' });
            sinon.assert.calledOnce(articleRepoStub);
            articleRepoStub.restore();
        });
    });
    describe('postCoverPhoto', () => {
        it('should save the cover photo successfully', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                coverPhoto: '',
                _id: 1,
                save: ((cb) => {
                    cb();
                })
            });
            const postImageStub = sandbox.stub(ImagesService, 'postImage').resolves({
                url: 'http://flickr.com/somephoto'
            });
            ArticleService.postCoverPhoto(1, 'file').then((article) => {
                expect(article.coverPhoto).to.be.eq('http://flickr.com/somephoto');

                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledWith(postImageStub, 'file', 'cover_photo/cover_1');
                sinon.assert.calledOnce(postImageStub);

                articleRepoStub.restore();
                postImageStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('fail to get the article to update', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').rejects();
            ArticleService.postCoverPhoto(1, 'file').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
        it('should get the article to update, but fail to post the image', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                coverPhoto: '',
                _id: 1,
                save: ((cb) => {
                    cb();
                })
            });
            const postImageStub = sandbox.stub(ImagesService, 'postImage').rejects();
            ArticleService.postCoverPhoto(1, 'file').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledWith(postImageStub, 'file', 'cover_photo/cover_1');
                sinon.assert.calledOnce(postImageStub);

                articleRepoStub.restore();
                postImageStub.restore();
                done();
            });
        });
        it('should save the cover photo successfully', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                coverPhoto: '',
                _id: 1,
                save: (cb) => {
                    cb('Error');
                }
            });
            const postImageStub = sandbox.stub(ImagesService, 'postImage').resolves({
                url: 'http://flickr.com/somephoto'
            });
            ArticleService.postCoverPhoto(1, 'file').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledWith(postImageStub, 'file', 'cover_photo/cover_1');
                sinon.assert.calledOnce(postImageStub);

                articleRepoStub.restore();
                postImageStub.restore();
                done();
            });
        });
    });
    describe('updateArticle', () => {
        it('should update an article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                _id: 1,
                text: '',
                coverPhoto: 'http://flickr.com/somephoto',
                datePosted: '',
                isPublished: false,
                save: ((cb) => {
                    cb();
                })
            });
            ArticleService.updateArticle(1, { text: '<p>Test article</p>' }).then((article) => {
                expect(article.coverPhoto).to.be.eq('http://flickr.com/somephoto');
                expect(article.text).to.be.eq('<p>Test article</p>');
                expect(article.isPublished).to.be.eq(false);

                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should update the datePosted property when the article is published and updated', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                _id: 1,
                text: '<p>Test article</p>',
                coverPhoto: 'http://flickr.com/somephoto',
                datePosted: 10,
                isPublished: false,
                save: (cb) => {
                    cb();
                }
            });
            ArticleService.updateArticle(1, { isPublished: true }).then((article) => {
                expect(article.coverPhoto).to.be.eq('http://flickr.com/somephoto');
                expect(article.text).to.be.eq('<p>Test article</p>');
                expect(article.isPublished).to.be.eq(true);
                expect(article.datePosted).to.be.approximately(Date.now(), 60000);

                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to retrieve the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').rejects();
            ArticleService.updateArticle(1, { isPublished: true }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
        it('should fail to update the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                _id: 1,
                text: '<p>Test article</p>',
                coverPhoto: 'http://flickr.com/somephoto',
                datePosted: 10,
                isPublished: false,
                save: (cb) => {
                    cb('Error');
                }
            });
            ArticleService.updateArticle(1, { isPublished: true }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
    });
    describe('deleteArticle', () => {
        it('remove the specified article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                _id: 1,
                remove: (cb) => {
                    cb();
                }
            });
            ArticleService.deleteArticle(1).then((message) => {
                expect(message).to.be.eq('The blog with the id 1 was removed');

                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to retrieve the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').rejects();
            ArticleService.deleteArticle(1).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
        it('should fail to remove the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                _id: 1,
                remove: (cb) => {
                    cb('Error');
                }
            });
            ArticleService.deleteArticle(1).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
    });
    /*

    deleteArticle: id => new Promise((resolve, reject) => ArticleRepository.get({
        _id: id
    }).then((article) => {
        article.remove((error) => {
            if (error) {
                log.critical('Failed to remove blog post');
                reject(error);
            } else {
                resolve(`The blog with the id ${article._id} was removed`);
            }
        });
    }).catch((err) => {
        log.critical('Error occured while deleting an article: ', err);
        reject(err);
    }))
    */
});