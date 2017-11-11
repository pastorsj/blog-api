import mongoose from 'mongoose';
import log from '../log';

const User = mongoose.model('User');

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * A route that allows a user to register themselves
 * into the database with a username that must be unique, a password, email and name.
 * @param {object} req The request object
 * @param {object} res The response object
 */
export function register(req, res) {
    if (!req.body.username || !req.body.name || !req.body.email ||
        !req.body.password) {
        sendJSONResponse(res, 400, {
            message: 'All fields required'
        });
        return;
    }
    User.findOne({ username: req.body.username }, (err, auser) => {
        if (auser) {
            sendJSONResponse(res, 409, {
                message: 'Username is taken.'
            });
        } else if (err) {
            log.critical('Error', err);
            sendJSONResponse(res, 404, {
                message: `An error has occcured: ${err}`
            });
        } else {
            const user = new User();

            user.username = req.body.username;
            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            user.save((error) => {
                if (err) {
                    sendJSONResponse(res, 404, error);
                } else {
                    const token = user.generateJwt();
                    sendJSONResponse(res, 200, {
                        token
                    });
                }
            });
        }
    });
}

/**
 * A route that allows a user to verify their username
 * and password and retrieve a JWT if it is correct
 * @param {object} req The request
 * @param {object} res The response
 */
export function login(req, res) {
    if (!req.headers.authorization || req.headers.authorization.split(':').length !== 2) {
        sendJSONResponse(res, 401, {
            message: 'Authentication failed. Makes sure that you insert your username and password in the Authorization header split by a colon'
        });
        return;
    }
    const usernamePassword = req.headers.authorization.split(':');
    const username = usernamePassword[0];
    const password = usernamePassword[1];

    User.findOne({
        username
    }, (err, user) => {
        if (err) {
            sendJSONResponse(res, 404, err);
            return;
        }
        if (!user) {
            sendJSONResponse(res, 401, {
                message: 'Authentication failed. User not found.'
            });
            return;
        }
        if (!user.validPassword(password)) {
            sendJSONResponse(res, 401, {
                message: 'Authentication failed. Wrong password.'
            });
            return;
        }
        user.generateJwt().then((tokenObj) => {
            const { accessToken, refreshToken, expiresIn } = tokenObj;
            sendJSONResponse(res, 200, {
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn
            });
        }).catch((error) => {
            sendJSONResponse(res, 500, {
                error
            });
        });
    });
}