import mongoose from 'mongoose';
import _ from 'lodash';

import ImageService from './image.service';

const projection = {
    _id: 1,
    username: 1,
    name: 1,
    email: 1,
    joinedDate: 1,
    profilePicture: 1
};

const UserService = {
    getUser: username => mongoose.model('User').findOne({ username }, projection),
    updateProfilePicture: (username, file) => new Promise((resolve, reject) =>
        mongoose.model('User').findOne({ username }, projection).then((user) => {
            if (file) {
                const path = `profile_pictures/profile_${user.username}`;
                ImageService.postImage(file, path)
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
        mongoose.model('User').findOne({ username }, projection).then((user) => {
            _.assign(user, updatedUser);
            user.save((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(user);
                }
            });
        })),
    deleteUser: username => new Promise((resolve, reject) => 
        mongoose.model('User').findOne({ username }).then((user) => {
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
