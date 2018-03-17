import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import UserRepository from '../../src/dal/repositories/user.repository';
import UserService from '../../src/business/services/user.service';
import ImagesService from '../../src/business/services/image.service';

const { expect } = chai;
chai.use(sinonChai);

describe('Test the User Service', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('retrieveAuthor', () => {
        it('should retrieve the author for a post', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'getAll').callsFake(() => {
                return {
                    limit: () => {
                        return {
                            exec: ((cb) => {
                                cb(null, [{ username: 'username' }]);
                            })
                        };
                    }
                };
            });
            UserService.retrieveAuthor({
                author: 'username',
                toObject: () => {
                    return {
                        author: {}
                    };
                }
            }).then((post) => {
                expect(post.author.username).to.be.eq('username');

                sinon.assert.calledWith(userRepoStub, { username: 'username' }, { name: 1, username: 1 });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to retrieve the author for a post', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'getAll').callsFake(() => {
                return {
                    limit: () => {
                        return {
                            exec: ((cb) => {
                                cb('Error');
                            })
                        };
                    }
                };
            });
            UserService.retrieveAuthor({
                author: 'username',
                toObject: () => {
                    return {
                        author: {}
                    };
                }
            }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' }, { name: 1, username: 1 });
                sinon.assert.calledOnce(userRepoStub);
                userRepoStub.restore();
                done();
            });
        });
    });
    describe('getUser', () => {
        it('should retrieve the user given the username', () => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').returns({ username: 'username' });
            const user = UserService.getUser('username');
            expect(user.username).to.be.eq('username');

            sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                _id: 1,
                username: 1,
                name: 1,
                email: 1,
                joinedDate: 1,
                profilePicture: 1
            });
            sinon.assert.calledOnce(userRepoStub);
            userRepoStub.restore();
        });
    });
    describe('updateProfilePicture', () => {
        it('should save the profile picture successfully', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                save: ((cb) => {
                    cb();
                })
            });
            const postImageStub = sandbox.stub(ImagesService, 'updateImage').resolves({
                url: 'http://flickr.com/somephoto'
            });
            UserService.updateProfilePicture('username', 'file').then((article) => {
                expect(article.profilePicture).to.be.eq('http://flickr.com/somephoto');

                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);
                sinon.assert.calledWith(postImageStub, 'file', 'profile_pictures/profile_username');
                sinon.assert.calledOnce(postImageStub);

                userRepoStub.restore();
                postImageStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should resolve when no file is passed in', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                save: ((cb) => {
                    cb();
                })
            });
            UserService.updateProfilePicture('username').then(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to get the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').rejects();
            UserService.updateProfilePicture('username', 'file').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            });
        });
        it('should fail to save the profile picture', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                save: ((cb) => {
                    cb('Error');
                })
            });
            const updateImageStub = sandbox.stub(ImagesService, 'updateImage').resolves({
                url: 'http://flickr.com/somephoto'
            });
            UserService.updateProfilePicture('username', 'file').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);
                sinon.assert.calledWith(updateImageStub, 'file', 'profile_pictures/profile_username');
                sinon.assert.calledOnce(updateImageStub);

                userRepoStub.restore();
                updateImageStub.restore();
                done();
            });
        });
    });
    describe('updateUser', () => {
        it('should update the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                save: ((cb) => {
                    cb();
                })
            });
            UserService.updateUser('username', { profilePicture: 'photo url' }).then((article) => {
                expect(article.profilePicture).to.be.eq('photo url');
                expect(article.username).to.be.eq('username');

                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to find the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').rejects();
            UserService.updateUser('username', { profilePicture: 'photo url' }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            });
        });
        it('should fail to save the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                save: ((cb) => {
                    cb('Error');
                })
            });
            UserService.updateUser('username', { profilePicture: 'photo url' }).then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' }, {
                    _id: 1,
                    username: 1,
                    name: 1,
                    email: 1,
                    joinedDate: 1,
                    profilePicture: 1
                });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            });
        });
    });
    describe('deleteUser', () => {
        it('should remove the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                remove: ((cb) => {
                    cb();
                })
            });
            UserService.deleteUser('username').then((message) => {
                expect(message).to.be.eq('The user with the username username was removed');

                sinon.assert.calledWith(userRepoStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            }).catch((err) => {
                done(err);
            });
        });
        it('should fail to find the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').rejects();
            UserService.deleteUser('username').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            });
        });
        it('should fail to save the user', (done) => {
            const userRepoStub = sandbox.stub(UserRepository, 'get').resolves({
                _id: 1,
                username: 'username',
                profilePicture: '',
                remove: ((cb) => {
                    cb('Error');
                })
            });
            UserService.deleteUser('username').then((output) => {
                done(output);
            }).catch(() => {
                sinon.assert.calledWith(userRepoStub, { username: 'username' });
                sinon.assert.calledOnce(userRepoStub);

                userRepoStub.restore();
                done();
            });
        });
    });
});
