import request from 'supertest';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import jwt from 'jsonwebtoken';

import app from '../../src/app';
import { SECRET } from '../../src/config/jwt.config';
import AuthService from '../../src/business/services/auth.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the /auth route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/auth/login', () => {
        it('should return an token object after successfully logging in', (done) => {
            const loginStub = sandbox.stub(AuthService, 'login').resolves({
                access_token: 'an access token',
                refresh_token: 'a refresh token',
                expires_in: 1000,
                token_type: 'Bearer'
            });
            request(app)
                .post('/api/auth/login')
                .set({ Authorization: 'testuser:test' })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    const { access_token, refresh_token, expires_in, token_type } = res.body;

                    expect(access_token).to.be.eq('an access token');
                    expect(refresh_token).to.be.eq('a refresh token');
                    expect(expires_in).to.be.eq(1000);
                    expect(token_type).to.be.eq('Bearer');

                    sinon.assert.calledWith(loginStub, 'testuser:test');
                    loginStub.restore();
                    return done();
                });
        });
        it('should fail to login', (done) => {
            sandbox.stub(AuthService, 'login').rejects();
            request(app)
                .post('/api/auth/login')
                .set({ Authorization: 'fakeUser:test' })
                .expect(401, done);
        });
        it('should fail to login since the authorization header was not provided', (done) => {
            request(app)
                .post('/api/auth/login')
                .expect(401, done);
        });
    });
    describe('/auth/register', () => {
        it('should successfully register a new user', (done) => {
            const registerStub = sandbox.stub(AuthService, 'register').resolves({
                access_token: 'an access token',
                refresh_token: 'a refresh token',
                expires_in: 1000,
                token_type: 'Bearer'
            });
            request(app)
                .post('/api/auth/register')
                .send({
                    username: 'anewuser',
                    name: 'A New Name',
                    email: 'anemail@anemail.com',
                    password: 'password'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        const { access_token, refresh_token, expires_in, token_type } = res.body;

                        expect(access_token).to.be.eq('an access token');
                        expect(refresh_token).to.be.eq('a refresh token');
                        expect(expires_in).to.be.eq(1000);
                        expect(token_type).to.be.eq('Bearer');

                        sinon.assert.calledWith(registerStub, 'anewuser', 'A New Name', 'anemail@anemail.com', 'password');
                        registerStub.restore();
                        done();
                    }
                });
        });
        it('should not successfully register', (done) => {
            sandbox.stub(AuthService, 'register').rejects();
            request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    name: 'New Name',
                    email: 'email@email.com',
                    password: 'password'
                })
                .expect(401, done);
        });
        it('should not successfully register a new user since the email was not provided', (done) => {
            request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    name: 'New Name',
                    password: 'password'
                })
                .expect(400)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        expect(res.body.error).to.be.eq('All fields including username, name, email and password are required');
                        done();
                    }
                });
        });
    });
    describe('/auth/token', () => {
        it('should successfully return a new access token when credentials are valid', (done) => {
            const refreshStub = sandbox.stub(AuthService, 'refreshAccessToken').resolves({
                access_token: 'an access token',
                refresh_token: 'a refresh token',
                expires_in: 1000,
                token_type: 'Bearer'
            });
            request(app)
                .post('/api/auth/token')
                .set({ Authorization: `Bearer ${token}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        const { access_token, refresh_token, expires_in, token_type } = res.body;

                        expect(access_token).to.be.eq('an access token');
                        expect(refresh_token).to.be.eq('a refresh token');
                        expect(expires_in).to.be.eq(1000);
                        expect(token_type).to.be.eq('Bearer');

                        sinon.assert.calledWith(refreshStub, token);
                        refreshStub.restore();
                        done();
                    }
                });
        });
        it('should not return a new access token when credentials are invalid', (done) => {
            sandbox.stub(AuthService, 'refreshAccessToken').rejects();
            request(app)
                .post('/api/auth/token')
                .set({ Authorization: `Bearer ${token}` })
                .expect(401, done);
        });
        it('should not return a new access token when refresh token not provided', (done) => {
            request(app)
                .post('/api/auth/token')
                .expect(401, done);
        });
    });
    describe('/auth/jwt/expired', () => {
        describe('POST', () => {
            it('should return that the jwt is valid', (done) => {
                sandbox.stub(AuthService, 'validateJwt').resolves('Valid Jwt');
                request(app)
                    .post('/api/auth/jwt/expired')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(204, done);
            });
            it('should return that the jwt is invalid', (done) => {
                sandbox.stub(AuthService, 'validateJwt').rejects('Invalid Jwt');
                request(app)
                    .post('/api/auth/jwt/expired')
                    .set({ Authorization: `Bearer ${token}1` })
                    .expect(401, done);
            });
            it('should return that the jwt is invalid since the authorization header was not included', (done) => {
                request(app)
                    .post('/api/auth/jwt/expired')
                    .expect(401, done);
            });
            it('should return that the jwt is malformed since it did not start with Bearer', (done) => {
                request(app)
                    .post('/api/auth/jwt/expired')
                    .set({ Authorization: `${token}1` })
                    .expect(400, done);
            });
        });
    })
});
