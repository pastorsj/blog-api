import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import UserRepository from '../../src/dal/repositories/user.repository';
import AuthService from '../../src/business/services/auth.service';
import ArticleRepository from '../../src/dal/repositories/article.repository';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the Auth Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('login', () => {
        it('should generate a set of tokens', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                validPassword: () => true,
                generateJwt: () => Promise.resolve({
                    accessToken: 'access token',
                    refreshToken: 'refresh token',
                    expiresIn: 1
                })
            });
            AuthService.login('username', 'password').then((tokenObj) => {
                expect(tokenObj.access_token).to.be.eq('access token');
                expect(tokenObj.refresh_token).to.be.eq('refresh token');
                expect(tokenObj.expires_in).to.be.eq(1);
                expect(tokenObj.token_type).to.be.eq('Bearer');

                sinon.assert.calledWith(userRepoStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail since the passwords did not match', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                validPassword: () => false
            });
            AuthService.login('username', 'password').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            });
        });
        it('should fail when the user does not exist', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').rejects();
            AuthService.login('username', 'password').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            });
        });
    });
    describe('refreshAccessToken', () => {
        it('should generate a new set of tokens', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                generateJwt: () => Promise.resolve({
                    accessToken: 'new access token',
                    refreshToken: 'new refresh token',
                    expiresIn: 1
                })
            });
            AuthService.refreshAccessToken('token').then((tokenObj) => {
                expect(tokenObj.access_token).to.be.eq('new access token');
                expect(tokenObj.refresh_token).to.be.eq('new refresh token');
                expect(tokenObj.expires_in).to.be.eq(1);
                expect(tokenObj.token_type).to.be.eq('Bearer');

                sinon.assert.calledWith(userRepoStub, { refreshToken: 'token' });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to find the token', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').rejects();
            AuthService.refreshAccessToken('token').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { refreshToken: 'token' });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            });
        });
    });
    describe('register', () => {
        it('should register the user and generate a new set of tokens', (done) => {
            const userRepoGetStub = sandbox.stub(UserRepository, 'get').resolves();
            const userRepoCreateStub = sandbox.stub(UserRepository, 'createUser').resolves({
                accessToken: 'access token',
                refreshToken: 'refresh token',
                expiresIn: 1
            });
            AuthService.register('username', 'name', 'email', 'password').then((tokenObj) => {
                expect(tokenObj.access_token).to.be.eq('access token');
                expect(tokenObj.refresh_token).to.be.eq('refresh token');
                expect(tokenObj.expires_in).to.be.eq(1);
                expect(tokenObj.token_type).to.be.eq('Bearer');

                sinon.assert.calledWith(userRepoGetStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoGetStub);
                sinon.assert.calledWith(userRepoCreateStub, 'username', 'name', 'email', 'password');
                sinon.assert.calledOnce(userRepoCreateStub);
                userRepoGetStub.restore();
                userRepoCreateStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should not register the user since their username was already taken', (done) => {
            const userRepoGetStub = sandbox.stub(UserRepository, 'get').resolves({
                username: 'username'
            });
            AuthService.register('username', 'name', 'email', 'password').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoGetStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoGetStub);
                userRepoGetStub.restore();
                done();
            });
        });
        it('should fail to register', (done) => {
            const userRepoGetStub = sandbox.stub(UserRepository, 'get').rejects();
            AuthService.register('username', 'name', 'email', 'password').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoGetStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoGetStub);
                userRepoGetStub.restore();
                done();
            });
        });
    });
    describe('canAccess', () => {
        it('should return true', () => {
            const canAccess = AuthService.canAccess({ username: 'username' }, 'username');
            expect(canAccess).to.be.eq(true);
        });
        it('should return false', () => {
            const cantAccess = AuthService.canAccess({ username: 'noaccess' }, 'username');
            expect(cantAccess).to.be.eq(false);
        });
    });
    describe('canUpdate', () => {
        it('should allow the user to update an article', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                author: 'username'
            });
            AuthService.canUpdate({ username: 'username' }, 1).then(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should not allow the user to update an article since the username did not match', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').resolves({
                author: 'otherusername'
            });
            AuthService.canUpdate({ username: 'username' }, 1).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
        it('should not allow the user to update an article since the article was not found', (done) => {
            const articleRepoStub = sandbox.stub(ArticleRepository, 'get').rejects();
            AuthService.canUpdate({ username: 'username' }, 1).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(articleRepoStub, { _id: 1 });
                sinon.assert.calledOnce(articleRepoStub);
                articleRepoStub.restore();
                done();
            });
        });
    });
    describe('validateJwt', () => {
        it('should verify the jwt', (done) => {
            const jwtStub = sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => {
                cb();
            });
            AuthService.validateJwt('valid').then((message) => {
                expect(message).to.be.eq('JWT is not expired');

                sinon.assert.calledWith(jwtStub, 'valid');
                sinon.assert.calledOnce(jwtStub);
                jwtStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should not verify the jwt', (done) => {
            const jwtStub = sandbox.stub(jwt, 'verify').callsFake((token, secret, cb) => {
                cb('JWT is expired');
            });
            AuthService.validateJwt('1.2.3').then((message) => {
                done(message);
            }).catch((err) => {
                expect(err.message).to.be.eq('JWT is expired');

                sinon.assert.calledWith(jwtStub, '1.2.3');
                sinon.assert.calledOnce(jwtStub);
                jwtStub.restore();
                done();
            });
        });
    });
});
