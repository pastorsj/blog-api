import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import ArticleRepository from '../../src/dal/repositories/article.repository';
import TagService from '../../src/business/services/tags.service';
import UserService from '../../src/business/services/user.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the Tags Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('getTagsByPopularity', () => {
        it('should retrieve all tags by popularity', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves([
                { tags: ['redis', 'express', 'mongo'] },
                { tags: ['mongo'] },
                { tags: ['redis'] }
            ]);
            TagService.getTagsByPopularity().then((allTags) => {
                expect(allTags.redis).to.be.eq(2);
                expect(allTags.express).to.be.eq(1);
                expect(allTags.mongo).to.be.eq(2);

                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, { tags: 1, _id: 0 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to retrieve any articles', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').rejects();
            TagService.getTagsByPopularity().then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, { tags: 1, _id: 0 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
        it('should error out when the data is malformed', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves([
                {},
                { tags: ['mongo'] },
                { tags: ['redis'] }
            ]);
            TagService.getTagsByPopularity().then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { isPublished: true }, { tags: 1, _id: 0 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
    });
    describe('getArticlesByTag', () => {
        it('should all articles given a tag', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves([
                { tags: ['redis', 'express', 'mongo'] },
                { tags: ['mongo'] },
                { tags: ['redis'] }
            ]);
            const userServiceStub = sandbox.stub(UserService, 'retrieveAuthor').resolves();
            TagService.getArticlesByTag('redis').then(() => {
                sinon.assert.calledWith(articleRepoStub, { tags: 'redis', isPublished: true });
                sinon.assert.calledOnce(articleRepoStub);
                sinon.assert.calledThrice(userServiceStub);
                articleRepoStub.restore();
                userServiceStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to get any articles', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').rejects();
            TagService.getArticlesByTag('redis').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { tags: 'redis', isPublished: true });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
        it('should error out when the data is malformed', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'getAll').resolves({});
            TagService.getArticlesByTag('redis').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { tags: 'redis', isPublished: true });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
    });
});
