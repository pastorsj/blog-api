import request from 'supertest';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';

import app from '../../src/app';
import acquireJwt from '../common/jwt.common';
import { setupUserCollection, destroyUsersCollection } from '../mocks/user.mock';
import ImageService from '../../src/business/services/image.service';

const { expect } = chai;

chai.use(sinonChai);

describe('Test the /user route', () => {
    let jwt = '';
    let sandbox;

    beforeEach((done) => {
        sandbox = sinon.sandbox.create();
        setupUserCollection()
            .then(() => acquireJwt(app))
            .then((res) => {
                jwt = res.body.access_token;
                done();
            }).catch((err) => {
                done(err);
            });
    });
    afterEach((done) => {
        sandbox.restore();
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
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.username).to.be.eq('testuser');
                            expect(data.name).to.be.eq('Test User');
                            expect(data.email).to.be.eq('testuser@test.com');
                            done();
                        }
                    });
            });
            it('should fail to retrieve a single user', (done) => {
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
                sandbox.stub(ImageService, 'postImage').resolves({ url: 'https://flickr.com' });
                request(app)
                    .post('/api/user/testuser')
                    .attach('profilePicture', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.name).to.be.eq('Test User');
                            expect(data.profilePicture).to.be.eq('https://flickr.com');
                            done();
                        }
                    });
            });
            it('should not update the users profile picture for security reasons', (done) => {
                request(app)
                    .post('/api/user/fakeuser')
                    .attach('profilePicture', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(401, done);
            });
            it('should fail to add a profile picture since service failed to post', (done) => {
                sandbox.stub(ImageService, 'postImage').rejects('Error');
                request(app)
                    .post('/api/user/testuser')
                    .attach('profilePicture', 'tests/common/testing.png')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        } else {
                            expect(res.body.error).to.be.eq('Error');
                            done();
                        }
                    });
            });
            it('should return nothing when a file is not uploaded', (done) => {
                sandbox.stub(ImageService, 'postImage').rejects({ status: 400, error: 'Error' });
                request(app)
                    .post('/api/user/testuser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(200, done);
            });
            it('should not upload the image since it is greater that 1mb', (done) => {
                request(app)
                    .post('/api/user/testuser')
                    .attach('profilePicture', 'tests/common/large.jpg')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(400, done);
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
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data.name).to.be.eq('A New Test User');
                            done();
                        }
                    });
            });
            it('should not update the user for security reasons', (done) => {
                request(app)
                    .put('/api/user/nouser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .send({
                        name: 'New Name'
                    })
                    .expect(401, done);
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
                            done(err);
                        } else {
                            const { data } = res.body;
                            expect(data).to.be.eq('The user with the username testuser was removed');
                            done();
                        }
                    });
            });
            it('should not delete the user for security reasons', (done) => {
                request(app)
                    .delete('/api/user/nouser')
                    .set({ Authorization: `Bearer ${jwt}` })
                    .expect(401, done);
            });
        });
    });
});
