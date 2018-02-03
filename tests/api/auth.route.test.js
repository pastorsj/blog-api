import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import { setupUserCollection, destroyUsersCollection } from '../mocks/user.mock';
import acquireJwt from '../common/jwt.common';

const { expect } = chai;

const jwtRegex = /([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/;

describe('Test the /auth route', () => {
    before((done) => {
        setupUserCollection().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
    after((done) => {
        destroyUsersCollection().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
    describe('/login', () => {
        it('should return an token object after successfully logging in', (done) => {
            request(app)
                .get('/api/login')
                .set({ Authorization: 'testuser:test' })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    const {
                        access_token,
                        refresh_token,
                        expires_in,
                        token_type
                    } = res.body;

                    expect(access_token).to.match(jwtRegex);
                    expect(refresh_token).to.match(jwtRegex);
                    expect(expires_in).to.be.a('number');
                    expect(token_type).to.be.eq('Bearer');
                    return done();
                });
        });
        it('should fail to login', (done) => {
            request(app)
                .get('/api/login')
                .set({ Authorization: 'testuser:test1' })
                .expect(401, done);
        });
        it('should fail to login since the authorization header was not provided', (done) => {
            request(app)
                .get('/api/login')
                .expect(401, done);
        });
    });
    describe('/register', () => {
        it('should successfully register a new user', (done) => {
            request(app)
                .post('/api/register')
                .send({
                    username: 'anewuser',
                    name: 'A New Name',
                    email: 'anemail@anemail.com',
                    password: 'password'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    const {
                        access_token,
                        refresh_token,
                        expires_in,
                        token_type
                    } = res.body;

                    expect(access_token).to.match(jwtRegex);
                    expect(refresh_token).to.match(jwtRegex);
                    expect(expires_in).to.be.a('number');
                    expect(token_type).to.be.eq('Bearer');
                    return done();
                });
        });
        it('should not successfully register a new user since the username is taken', (done) => {
            request(app)
                .post('/api/register')
                .send({
                    username: 'testuser',
                    name: 'New Name',
                    email: 'email@email.com',
                    password: 'password'
                })
                .expect(409)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body.message).to.be.eq('Username is taken.');
                    return done();
                });
        });
        it('should not successfully register a new user since the email was not provided', (done) => {
            request(app)
                .post('/api/register')
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
                        expect(res.body.message).to.be.eq('All fields required');
                        done();
                    }
                });
        });
    });
    describe('/auth/token', () => {
        let refreshToken;
        beforeEach((done) => {
            acquireJwt(app).then((res) => {
                refreshToken = res.body.refresh_token;
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should successfully return a new access token when credentials are valid', (done) => {
            request(app)
                .get('/api/auth/token')
                .set({ Authorization: `Bearer ${refreshToken}` })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    const {
                        access_token,
                        refresh_token,
                        expires_in,
                        token_type
                    } = res.body;

                    expect(access_token).to.match(jwtRegex);
                    expect(refresh_token).to.be.eq(refresh_token);
                    expect(expires_in).to.be.a('number');
                    expect(token_type).to.be.eq('Bearer');
                    return done();
                });
        });
        it('should not return a new access token when credentials are invalid', (done) => {
            request(app)
                .get('/api/auth/token')
                .set({ Authorization: `Bearer ${refreshToken}sjfa` })
                .expect(401, done);
        });
        it('should not return a new access token when refresh token not provided', (done) => {
            request(app)
                .get('/api/auth/token')
                .expect(401, done);
        });
    });
});
