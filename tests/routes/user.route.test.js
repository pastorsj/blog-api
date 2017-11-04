import request from 'supertest';
import chai from 'chai';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';
import { setupUserCollection, destroyUsersCollection } from '../mocks/user.mock';

const { expect } = chai;

describe('Test the /user route', () => {
    let jwt = '';
    beforeEach((done) => {
        setupUserCollection().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
    beforeEach((done) => {
        acquireJwt(app).then((res) => {
            jwt = res.body.token;
            done();
        }).catch((err) => {
            done(err);
        });
    });
    afterEach((done) => {
        destroyUsersCollection().then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });
    describe('/:username', () => {
        describe('GET', () => {
            it('should retrieve a single user', (done) => {
                request(app)
                    .get('/api/user/testuser')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.data.username).to.be.eq('testuser');
                        expect(res.body.data.name).to.be.eq('Test User');
                        expect(res.body.data.email).to.be.eq('testuser@test.com');
                        return done();
                    });
            });
            it('should fail to retrieve a single user', (done) => {
                request(app)
                    .get('/api/user/nouser')
                    .expect(404, done);
            });
        });
        describe('PUT', () => {
            it('should update a single user', (done) => {
                request(app)
                    .put('/api/user/testuser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        name: 'A New Test User'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.data.name).to.be.eq('A New Test User');
                        return done();
                    });
            });
            it('should not update the user since the user could not be found', (done) => {
                request(app)
                    .put('/api/user/nouser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        name: 'New Name'
                    })
                    .expect(404, done);
            });
        });
        describe('DELETE', () => {
            it('should delete a single user', (done) => {
                request(app)
                    .delete('/api/user/testuser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.data).to.be.eq('The user with the username testuser was removed');
                        return done();
                    });
            });
            it('should not delete the user since the user could not be found', (done) => {
                request(app)
                    .delete('/api/user/nouser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(404, done);
            });
        });
    });
});
