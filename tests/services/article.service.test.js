import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import ArticleRepository from '../../src/dal/repositories/article.repository';
import ArticleService from '../../src/business/services/article.service';
import UserService from '../../src/business/services/user.service';

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
        
    });
    describe('updateArticle', () => {
        
    });
    describe('deleteArticle', () => {
        
    });
});