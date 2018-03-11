import jwt from 'jsonwebtoken';

import { SECRET } from '../../config/jwt.config';
import UserRepository from '../../dal/repositories/user.repository';
import log from '../../log';
import ArticleRepository from '../../dal/repositories/article.repository';

const AuthService = {
    login: (username, password) => new Promise((resolve, reject) => {
        UserRepository.get({ username }).then((user) => {
            if (!user.validPassword(password)) {
                reject(new Error('Authentication failed. Wrong password.'));
            } else {
                user.generateJwt().then((tokenObj) => {
                    const { accessToken, refreshToken, expiresIn } = tokenObj;
                    resolve({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn,
                        token_type: 'Bearer'
                    });
                });
            }
        }).catch(() => {
            reject(new Error('Authentication failed. User not found'));
        });
    }),
    refreshAccessToken: token => new Promise((resolve, reject) => {
        UserRepository.get({ refreshToken: token }).then((user) => {
            user.generateJwt().then((tokenObj) => {
                const { accessToken, refreshToken, expiresIn } = tokenObj;
                resolve({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn,
                    token_type: 'Bearer'
                });
            });
        }).catch((err) => {
            log.critical('Unable to refresh token:', err);
            reject(new Error('Authentication failed.'));
        });
    }),
    register: (username, name, email, password) => new Promise((resolve, reject) => {
        UserRepository.get({ username }).then((auser) => {
            if (auser) {
                reject(new Error('Username is already taken'));
            } else {
                UserRepository.createUser(username, name, email, password).then((tokenObj) => {
                    const { accessToken, refreshToken, expiresIn } = tokenObj;
                    resolve({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn,
                        token_type: 'Bearer'
                    });
                });
            }
        }).catch((err) => {
            reject(new Error(`An error has occcured: ${err}`));
        });
    }),
    canAccess: (payload, username) => payload.username === username,
    canUpdate: (payload, id) => new Promise((resolve, reject) => {
        ArticleRepository.get({
            _id: id
        }).then((blog) => {
            if (payload.username === blog.author) {
                resolve();
            } else {
                reject(new Error('Unable to update this article'));
            }
        }).catch(() => {
            reject(new Error('Article not found'));
        });
    }),
    validateJwt: token => new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err) => {
            if (err) {
                reject(new Error('JWT is expired'));
            } else {
                resolve('JWT is not expired');
            }
        });
    })
};

export default AuthService;
