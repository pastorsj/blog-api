import request from 'supertest';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import jwt from 'jsonwebtoken';

import app from '../../src/app';
import ArticleService from '../../src/business/services/article.service';
import AuthService from '../../src/business/services/auth.service';
import { SECRET } from '../../src/config/jwt.config';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the /articles route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/articles/:username', () => {
        it('should return two articles written by testuser', (done) => {
            sandbox.stub(AuthService, 'canAccess').returns(true);
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
                .get('/api/articles/testuser')
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
            sandbox.stub(AuthService, 'canAccess').returns(false);
            request(app)
                .get('/api/articles/fakeuser')
                .set({ Authorization: `Bearer ${token}` })
                .expect(401, done);
        });
        it('should error out when no articles are found', (done) => {
            sandbox.stub(AuthService, 'canAccess').returns(true);
            sandbox.stub(ArticleService, 'getAllArticlesForAuthor').rejects('Error');
            request(app)
                .get('/api/articles/testuser')
                .set({ Authorization: `Bearer ${token}` })
                .expect(404, done);
        });
    });
});
