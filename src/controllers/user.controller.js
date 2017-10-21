'use strict';

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

const trimUserInfo = function(user) {
    delete user._id;
    delete user.__v;
    delete user.password;
    delete user.salt;
    delete user.hash;
};

const UserController = {
    get: (req, res) => {
        mongoose.model('User').findOne({
            username: req.params.username
        }, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                user = user.toObject();
                trimUserInfo(user);
                sendJSONResponse(res, 200, {
                    data: user
                });
            }
        });
    },
    post: function(req, res) {
        mongoose.model('User').findOne({
            username: req.params.username
        }, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else if (req.file) {
                const file = req.file;
                const path = `profile_pictures/profile_${user.username}`;
                ImageService.postImage(file, path)
                    .then(result => {
                        user.profilePicture = result.url;
                        user.save(err => {
                            if (err) {
                                sendJSONResponse(res, 500, {
                                    error: err
                                });
                            } else {
                                user = user.toObject(); // Not needed, use projections
                                trimUserInfo(user);
                                sendJSONResponse(res, 200, {
                                    data: user
                                });
                            }
                        });
                    })
                    .catch(err => {
                        sendJSONResponse(res, err.status, {
                            error: err.error
                        });
                    });
            } else {
                sendJSONResponse(res, 204, {
                    data: ''
                });
            }
        });
    },
    put: function(req, res) {
        mongoose.model('User').findOne({
            username: req.params.username
        }, (err, user) => {
            if (err || _.isEmpty(user)) {
                sendJSONResponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                _.assign(user, req.body);
                user.save(err => {
                    if (err) {
                        sendJSONResponse(res, 500, {
                            error: err
                        });
                    } else {
                        user = user.toObject();
                        trimUserInfo(user);
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
                user.remove(err => {
                    if (err) {
                        sendJSONResponse(res, 404, {
                            error: err || 'User Not Found'
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
