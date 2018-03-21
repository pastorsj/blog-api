import ImageService from './image.service';
import UserRepository from '../../dal/repositories/user.repository';
import log from '../../log';

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
        UserRepository.getAll({ username: post.author }, { name: 1, username: 1 })
            .limit(1)
            .exec((err, author) => {
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
    deleteUser: username => new Promise((resolve, reject) => {
        UserRepository.remove(username).then((deletedUser) => {
            if (deletedUser) {
                resolve(`The user with the username ${username} was removed`);
            } else {
                reject(new Error(`The user with the username ${username} does not exist`));
            }
        }).catch((error) => {
            log.critical('Error occured while deleting an user: ', error);
            reject(error);
        });
    })
};

export default UserService;
