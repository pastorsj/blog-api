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
                ImageService.updateImage(file, path, user.profilePicture)
                    .then((result) => {
                        const updatedUser = {
                            ...user,
                            profilePicture: result.url
                        };
                        UserService.updateUser(username, updatedUser)
                            .then(resolve)
                            .catch(reject);
                    });
            } else {
                resolve('');
            }
        }).catch((err) => {
            reject(err);
        })),
    updateUser: (username, updatedUser) => new Promise((resolve, reject) => {
        UserRepository.update(username, updatedUser).then((user) => {
            if (user) {
                resolve(user);
            } else {
                reject(new Error(`The user with the username ${username} does not exist`));
            }
        }).catch((error) => {
            log.critical('Error occured while updating an user: ', error);
            reject(error);
        });
    }),
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
