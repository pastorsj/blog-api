import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import ArticleRepository from '../../src/dal/repositories/article.repository';
import ArticleService from '../../src/business/services/article.service';
import UserService from '../../src/business/services/user.service';
import ImagesService from '../../src/business/services/image.service';
import SubscriptionService from '../../src/business/services/subscription.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the Article Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('getAllArticlesForAuthor', () => {
        it('should get all articles from the article repository', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves(['article1', 'article2']);
            ArticleService.getAllArticlesForAuthor('testuser', {}).then((articles) => {
                expect(articles.length).to.be.eq(2);

                sinon.assert.calledWith(articleRepoStub, {
                    author: 'testuser'
                });
                articleRepoStub.restore();
                done();
            }).catch(error => done(error));
        });
    });
    describe('getAllPublishedArticles', () => {
        it('should retrieve all articles with author information attached', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves(['article1', 'article2']);
            const retrieveAuthorStub = sandbox.stub(UserService, 'retrieveAuthor').resolves({ text: 'article', author: { username: 'test' } });
            ArticleService.getAllPublishedArticles({}).then((articles) => {
                expect(articles.length).to.be.eq(2);

                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, {}, { __v: 0 });
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
            ArticleService.getAllPublishedArticles({}).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, {}, { __v: 0 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
    });
    describe('getArticleById', () => {
        it('should get an article by its id', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({ text: '<p>Test article</p>' });
            ArticleService.getArticleById(1).then((article) => {
                expect(article.text).to.be.eq('<p>Test article</p>');

                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            }).catch(error => done(error));
        });
    });
    describe('getByTag', () => {
        it('should all articles with a tag', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves(['article1', 'article2']);
            ArticleService.getByTag('redis', {}).then((articles) => {
                expect(articles.length).to.be.eq(2);

                sinon.assert.calledWith(articleRepoStub, {
                    tags: 'redis',
                    isPublished: true
                });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            }).catch(error => done(error));
        });
    });
    describe('getByTitle', () => {
        it('should all articles by title', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves(['article1', 'article2']);
            ArticleService.getByTitle('title', {}).then((articles) => {
                expect(articles.length).to.be.eq(2);

                sinon.assert.calledWith(articleRepoStub, {
                    title: {
                        $regex: '^title',
                        $options: 'i'
                    },
                    isPublished: true
                },
                {},
                {
                    _id: 1,
                    title: 1,
                    tags: 1
                });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            }).catch(error => done(error));
        });
        it('should return nothing with no title is passed in', (done) => {
            ArticleService.getByTitle('').then((articles) => {
                expect(articles.length).to.be.eq(0);
                done();
            }).catch(error => done(error));
        });
    });
    describe('createArticle', () => {
        it('should create an article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'create').resolves({ text: '<p>Test article</p>' });
            ArticleService.createArticle({ text: '<p>Test article</p>' }).then((article) => {
                expect(article.text).to.be.eq('<p>Test article</p>');

                sinon.assert.calledWith(articleRepoStub, { text: '<p>Test article</p>' });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            }).catch(error => done(error));
        });
    });
    describe('postCoverPhoto', () => {
        it('should save the cover photo successfully', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                coverPhoto: '',
                _id: 1
            });
            const articleRepoSaveStub = sandbox.stub(ArticleRepository, 'update').resolves({
                coverPhoto: 'http://flickr.com/somephoto',
                _id: 1
            });
            const postImageStub = sandbox.stub(ImagesService, 'postImage').resolves({
                url: 'http://flickr.com/somephoto'
            });
            ArticleService.postCoverPhoto(1, 'file').then((article) => {
                expect(article.coverPhoto).to.be.eq('http://flickr.com/somephoto');

                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledWith(articleRepoSaveStub, 1, { _id: 1, coverPhoto: 'http://flickr.com/somephoto' });
                sinon.assert.calledOnce(articleRepoSaveStub);
                sinon.assert.calledWith(postImageStub, 'file', 'cover_photo/cover_1');
                sinon.assert.calledOnce(postImageStub);

                articleRepoStub.restore();
                articleRepoSaveStub.restore();
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
                _id: 1
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
        it('should do nothing when the is no file to update', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                coverPhoto: '',
                _id: 1
            });
            const postImageStub = sandbox.stub(ImagesService, 'postImage').resolves({
                url: 'http://flickr.com/somephoto'
            });
            ArticleService.postCoverPhoto(1, '').then(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                postImageStub.restore();
                done();
            }).catch((error) => {
                done(error);
            });
        });
    });
    describe('updateArticle', () => {
        it('should update an article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'update').resolves({
                _id: 1,
                text: '<p>Test article</p>',
                coverPhoto: 'http://flickr.com/somephoto',
                datePosted: '',
                isPublished: false
            });
            ArticleService.updateArticle(1, { text: '<p>Test article</p>' }).then((article) => {
                expect(article.coverPhoto).to.be.eq('http://flickr.com/somephoto');
                expect(article.text).to.be.eq('<p>Test article</p>');
                expect(article.isPublished).to.be.eq(false);

                sinon.assert.calledWith(articleRepoStub, 1, {
                    text: '<p>Test article</p>'
                });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should update the datePosted property when the article is published and updated', (done) => {
            const currentDate = Date.now();
            const articleRepoStub = sandbox.stub(ArticleRepository, 'update').resolves({
                _id: 1,
                text: '<p>Test article</p>',
                coverPhoto: 'http://flickr.com/somephoto',
                datePosted: currentDate,
                isPublished: true
            });
            const subscriptionServiceStub = sandbox.stub(SubscriptionService, 'publishedArticleNotification').resolves();
            ArticleService.updateArticle(1, { isPublished: true }).then((article) => {
                expect(article.coverPhoto).to.be.eq('http://flickr.com/somephoto');
                expect(article.text).to.be.eq('<p>Test article</p>');
                expect(article.isPublished).to.be.eq(true);
                expect(article.datePosted).to.be.eq(currentDate);

                sinon.assert.calledWith(articleRepoStub, 1, { isPublished: true, datePosted: sinon.match.date });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledWith(subscriptionServiceStub, {
                    _id: 1,
                    text: '<p>Test article</p>',
                    coverPhoto: 'http://flickr.com/somephoto',
                    datePosted: currentDate,
                    isPublished: true
                });
                sinon.assert.calledOnce(subscriptionServiceStub);

                articleRepoStub.restore();
                subscriptionServiceStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to retrieve the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'update').resolves();
            ArticleService.updateArticle(1, { isPublished: false }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, 1, { isPublished: false });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
        it('should fail to update the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'update').rejects();
            ArticleService.updateArticle(1, { isPublished: false }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, 1, { isPublished: false });
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
    });
    describe('deleteArticle', () => {
        it('remove the specified article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'remove').resolves({
                _id: 1
            });
            ArticleService.deleteArticle(1).then((message) => {
                expect(message).to.be.eq('The blog with the id 1 was removed');

                sinon.assert.calledWith(articleRepoStub, 1);
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to retrieve the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'remove').resolves();
            ArticleService.deleteArticle(1).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, 1);
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
        it('should fail to remove the requested article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'remove').rejects();
            ArticleService.deleteArticle(1).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, 1);
                sinon.assert.calledOnce(articleRepoStub);

                articleRepoStub.restore();
                done();
            });
        });
    });
});
