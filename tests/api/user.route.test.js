import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

import app from '../../src/app';
import { SECRET } from '../../src/config/jwt.config';
import UserService from '../../src/business/services/user.service';
import AuthService from '../../src/business/services/auth.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /user route', () => {
    const token = jwt.sign({ id: 1 }, SECRET, { expiresIn: 3600 });
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('/:username', () => {
        describe('GET', () => {
            it('should retrieve a single user', (done) => {
                const getUserStub = sandbox.stub(UserService, 'getUser').resolves({
                    username: 'testuser',
                    name: 'Test User',
                    email: 'testuser@test.com'
                });
                request(app)
                    .get('/api/user/testuser')
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.username).to.be.eq('testuser');
                            expect(data.name).to.be.eq('Test User');
                            expect(data.email).to.be.eq('testuser@test.com');

                            sinon.assert.calledWith(getUserStub, 'testuser');
                            getUserStub.restore();
                            done();
                        }
                    });
            });
            it('should fail to retrieve a single user', (done) => {
                sandbox.stub(UserService, 'getUser').rejects();
                request(app)
                    .get('/api/user/nouser')
                    .expect(404, done);
            });
        });
        describe('POST', () => {
            afterEach((done) => {
                fs.readdir('uploads', (err, files) => {
                    if (err) {
                        done(err);
                    } else {
                        files.forEach((file) => {
                            fs.unlinkSync(path.join('uploads', file));
                        });
                        done();
                    }
                });
            });
            it('should update/add a profile picture url to a user', (done) => {
                const updateProfilePictureStub = sandbox.stub(UserService, 'updateProfilePicture').resolves({
                    profilePicture: 'https://flickr.com',
                    name: 'Test User'
                });
                sandbox.stub(AuthService, 'canAccess').returns(true);
                request(app)
                    .post('/api/user/testuser')
                    .attach('profilePicture', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.name).to.be.eq('Test User');
                            expect(data.profilePicture).to.be.eq('https://flickr.com');

                            sinon.assert.calledWith(updateProfilePictureStub, 'testuser');
                            updateProfilePictureStub.restore();
                            done();
                        }
                    });
            });
            it('should not update the users profile picture for security reasons', (done) => {
                sandbox.stub(AuthService, 'canAccess').returns(false);
                request(app)
                    .post('/api/user/fakeuser')
                    .attach('profilePicture', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(401, done);
            });
            it('should error out when the update fails', (done) => {
                sandbox.stub(AuthService, 'canAccess').returns(true);
                sandbox.stub(UserService, 'updateProfilePicture').rejects();
                request(app)
                    .post('/api/user/testuser')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(400, done);
            });
            it('should not upload the image since it is greater that 1mb', (done) => {
                sandbox.stub(AuthService, 'canAccess').returns(true);
                request(app)
                    .post('/api/user/testuser')
                    .attach('profilePicture', 'tests/common/large.jpg')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(400, done);
            });
        });
        describe('PUT', () => {
            it('should update a single user', (done) => {
                const updateUserStub = sandbox.stub(UserService, 'updateUser').resolves({
                    profilePicture: 'https://flickr.com',
                    name: 'A New Test User'
                });
                sandbox.stub(AuthService, 'canAccess').returns(true);
                request(app)
                    .put('/api/user/testuser')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        name: 'A New Test User'
                    })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.name).to.be.eq('A New Test User');

                            sinon.assert.calledWith(updateUserStub, 'testuser', {
                                name: 'A New Test User'
                            });
                            updateUserStub.restore();
                            done();
                        }
                    });
            });
            it('should not update the user for security reasons', (done) => {
                sandbox.stub(AuthService, 'canAccess').returns(false);
                request(app)
                    .put('/api/user/nouser')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        name: 'New Name'
                    })
                    .expect(401, done);
            });
            it('should fail to update a user', (done) => {
                sandbox.stub(UserService, 'updateUser').rejects();
                sandbox.stub(AuthService, 'canAccess').returns(true);
                request(app)
                    .put('/api/user/auser')
                    .set({ Authorization: `Bearer ${token}` })
                    .send({
                        name: 'New Name'
                    })
                    .expect(404, done);
            });
        });
        describe('DELETE', () => {
            it('should delete a single user', (done) => {
                const deleteUserStub = sandbox.stub(UserService, 'deleteUser').resolves('The user with the username testuser was removed');
                sandbox.stub(AuthService, 'canAccess').returns(true);
                request(app)
                    .delete('/api/user/testuser')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data).to.be.eq('The user with the username testuser was removed');

                            sinon.assert.calledWith(deleteUserStub, 'testuser');
                            deleteUserStub.restore();
                            done();
                        }
                    });
            });
            it('should not delete the user for security reasons', (done) => {
                sandbox.stub(AuthService, 'canAccess').returns(false);
                request(app)
                    .delete('/api/user/nouser')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(401, done);
            });
            it('should not delete the user for security reasons', (done) => {
                sandbox.stub(UserService, 'deleteUser').rejects();
                sandbox.stub(AuthService, 'canAccess').returns(true);
                request(app)
                    .delete('/api/user/auser')
                    .set({ Authorization: `Bearer ${token}` })
                    .expect(404, done);
            });
        });
    });
});
