import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import { setupUserCollection, destroyUsersCollection } from '../mocks/user.mock';

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
        it('should return a jwt after successfully logging in', (done) => {
            request(app)
                .get('/api/login')
                .set({ Authorization: 'testuser:test' })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body.token).to.match(jwtRegex);
                    return done();
                });
        });
        it('should fail to login', (done) => {
            request(app)
                .get('/api/login')
                .set({ Authorization: 'testuser:test1' })
                .expect(404)
                .end(() => {
                    return done();
                });
        });
    });
    describe('/register', () => {
        it('should successfully register a new user', (done) => {
            request(app)
                .post('/api/register')
                .send({
                    username: 'newuser',
                    name: 'New Name',
                    email: 'email@email.com',
                    password: 'password'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body.token).to.match(jwtRegex);
                    return done();
                });
        });
        it('should not successfully register a new user since the username is take', (done) => {
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
    });
});
