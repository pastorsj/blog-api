import jwt from 'jsonwebtoken';
import { SECRET } from '../../config/jwt.config';
import Response from './response';
import AuthService from '../../business/services/auth.service';

/**
 * ROUTE: /auth/*
 */

const AuthController = {
    validateJWT: (req, res) => {
        if (!req.headers.authorization) {
            Response.error(res, 401, 'Authorization header not included');
        } else {
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader.startsWith('Bearer ')) {
                const token = authorizationHeader.slice(7);
                jwt.verify(token, SECRET, (err) => {
                    if (err) {
                        Response.error(res, 401, 'JWT is expired');
                    } else {
                        Response.message(res, 204, 'JWT is not expired');
                    }
                });
            } else {
                Response.message(res, 400, 'Authorization header is malformed. It needs to start with Bearer');
            }
        }
    },
    login: (req, res) => {
        if (!req.headers.authorization || req.headers.authorization.split(':').length !== 2) {
            Response.error(res, 401, 'Authentication failed. Makes sure that you insert your username and password in the Authorization header split by a colon');
        } else {
            AuthService.login(req.headers.authorization).then((tokens) => {
                Response.custom(res, 200, tokens);
            }).catch((err) => {
                Response.error(res, 401, err);
            });
        }
    },
    register: (req, res) => {
        const {
            username, name, email, password
        } = req.body;
        if (!username || !name || !email || !password) {
            Response.error(res, 400, 'All fields including username, name, email and password are required');
        } else {
            AuthService.register(username, name, email, password).then((tokens) => {
                Response.custom(res, 200, tokens);
            }).catch((err) => {
                Response.error(res, 401, err);
            });
        }
    },
    refreshAccessToken: (req, res) => {
        let token = req.headers.authorization;
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
            AuthService.refreshAccessToken(token).then((tokens) => {
                Response.custom(res, 200, tokens);
            }).catch((err) => {
                Response.error(res, 401, err);
            });
        } else {
            Response.error(res, 401, 'Authentication failed. Token was malformed');
        }
    },
    isAccessible: (req, res, next) => {
        const { payload, params: { username } } = req;
        const isAccessible = AuthService.canAccess(payload, username);
        if (isAccessible) {
            next();
        } else {
            Response.error(res, 401, `Unable to access ${username}'s articles`);
        }
    },
    canUpdate: (req, res, next) => {
        const { payload, params: { id } } = req;
        AuthService.canUpdate(payload, id)
            .then(() => next())
            .catch((error) => {
                Response.error(res, 401, error);
            });
    },
    canPost: (req, res, next) => {
        const { payload, body: { author } } = req;
        const isAccessible = AuthService.canAccess(payload, author);
        if (isAccessible) {
            next();
        } else {
            Response.error(res, 401, `Unable to create this article under this username: ${author})`);
        }
    }
};

export default AuthController;
