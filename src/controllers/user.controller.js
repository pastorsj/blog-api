

import mongoose from 'mongoose';
import _ from 'lodash';

import ImageService from '../services/image.service';

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    if (content) {
        res.json(content);
    }
};

/**
 * ROUTE: user/:username
 */

const projection = {
    _id: 1,
    username: 1,
    name: 1,
    email: 1,
    joinedDate: 1,
    profilePicture: 1
};

const UserController = {
    get: (req, res) => {
        mongoose.model('User').findOne({
            username: req.params.username
        }, projection, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                sendJSONResponse(res, 200, {
                    data: user
                });
            }
        });
    },
    post(req, res) {
        mongoose.model('User').findOne({
            username: req.params.username
        }, projection, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else if (req.file) {
                const { file } = req;
                const path = `profile_pictures/profile_${user.username}`;
                ImageService.postImage(file, path)
                    .then((result) => {
                        user.profilePicture = result.url;
                        user.save((error) => {
                            if (err) {
                                sendJSONResponse(res, 500, {
                                    error
                                });
                            } else {
                                sendJSONResponse(res, 200, {
                                    data: user
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        sendJSONResponse(res, error.status, {
                            error: error.error
                        });
                    });
            } else {
                sendJSONResponse(res, 204, {
                    data: ''
                });
            }
        });
    },
    put(req, res) {
        mongoose.model('User').findOne({
            username: req.params.username
        }, projection, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                _.assign(user, req.body);
                user.save((error) => {
                    if (err) {
                        sendJSONResponse(res, 500, {
                            error
                        });
                    } else {
                        sendJSONResponse(res, 200, {
                            data: user
                        });
                    }
                });
            }
        });
    },
    delete: (req, res) => {
        mongoose.model('User').findOne({
            username: req.params.username
        }, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                user.remove((error) => {
                    if (err) {
                        sendJSONResponse(res, 404, {
                            error: error || 'User Not Found'
                        });
                    } else {
                        sendJSONResponse(res, 200, {
                            data: `The user with the username ${user.username} was removed`
                        });
                    }
                });
            }
        });
    }
};

export default UserController;
