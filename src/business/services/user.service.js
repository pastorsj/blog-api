import _ from 'lodash';

import ImageService from './image.service';
import UserRepository from '../../dal/repositories/user.repository';

const projection = {
    _id: 1,
    username: 1,
    name: 1,
    email: 1,
    joinedDate: 1,
    profilePicture: 1
};

const UserService = {
    retrieveAuthor: post => new Promise((resolve, reject) => {
        UserRepository.getAll({ username: post.author }, { name: 1, username: 1 }).limit(1).exec((err, author) => {
            if (err || author.length < 1) {
                reject(err || 'No authors found');
            }
            const postObject = post.toObject();
            postObject.author = author.pop();
            resolve(postObject);
        });
    }),
    getUser: username => UserRepository.get({ username }, projection),
    updateProfilePicture: (username, file) => new Promise((resolve, reject) =>
        UserRepository.get({ username }, projection).then((user) => {
            if (file) {
                const path = `profile_pictures/profile_${user.username}`;
                ImageService.updateImage(file, path, user.profilePicture)
                    .then((result) => {
                        user.profilePicture = result.url; //eslint-disable-line
                        user.save((error) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(user);
                            }
                        });
                    });
            } else {
                resolve('');
            }
        }).catch((err) => {
            reject(err);
        })),
    updateUser: (username, updatedUser) => new Promise((resolve, reject) =>
        UserRepository.get({ username }, projection).then((user) => {
            _.assign(user, updatedUser);
            user.save((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(user);
                }
            });
        }).catch((err) => {
            reject(err);
        })),
    deleteUser: username => new Promise((resolve, reject) =>
        UserRepository.get({ username }).then((user) => {
            user.remove((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(`The user with the username ${user.username} was removed`);
                }
            });
        }).catch((err) => {
            reject(err);
        }))
};

export default UserService;
