import mongoose from 'mongoose';

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
    const {
        username,
        name,
        email,
        password
    } = req.body;
    if (!username || !name || !email || !password) {
        sendJSONResponse(res, 400, {
            message: 'All fields required'
        });
    } else {
        User.findOne({ username }).then((auser) => {
            if (auser) {
                sendJSONResponse(res, 409, {
                    message: 'Username is taken.'
                });
            } else {
                const user = new User();

                user.username = username;
                user.name = name;
                user.email = email;
                user.setPassword(password);

                user.save()
                    .then(() => user.generateJwt())
                    .then((tokenObj) => {
                        const { accessToken, refreshToken, expiresIn } = tokenObj;
                        sendJSONResponse(res, 200, {
                            access_token: accessToken,
                            refresh_token: refreshToken,
                            expires_in: expiresIn,
                            token_type: 'Bearer'
                        });
                    });
            }
        }).catch((err) => {
            sendJSONResponse(res, 404, {
                message: `An error has occcured: ${err}`
            });
        });
    }
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
    }).then((user) => {
        if (!user) {
            sendJSONResponse(res, 401, {
                message: 'Authentication failed. User not found.'
            });
        } else if (!user.validPassword(password)) {
            sendJSONResponse(res, 401, {
                message: 'Authentication failed. Wrong password.'
            });
        } else {
            user.generateJwt().then((tokenObj) => {
                const { accessToken, refreshToken, expiresIn } = tokenObj;
                sendJSONResponse(res, 200, {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn,
                    token_type: 'Bearer'
                });
            });
        }
    }).catch((err) => {
        sendJSONResponse(res, 404, err);
    });
}

export function refreshAccessToken(req, res) {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
        User.findOne({
            refreshToken: token
        }).then((user) => {
            if (!user) {
                sendJSONResponse(res, 401, {
                    message: 'Authentication failed.'
                });
            } else {
                user.generateJwt().then((tokenObj) => {
                    const { accessToken, refreshToken, expiresIn } = tokenObj;
                    sendJSONResponse(res, 200, {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn,
                        token_type: 'Bearer'
                    });
                });
            }
        }).catch((err) => {
            sendJSONResponse(res, 401, err);
        });
    } else {
        sendJSONResponse(res, 401, {
            message: 'Authentication failed. Token was malformed'
        });
    }
}
