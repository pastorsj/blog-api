'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import mime from 'mime';

import ImagesController from '../controllers/images.controller';

const sendJSONresponse = (res, status, content) => {
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
                sendJSONresponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                user = user.toObject();
                trimUserInfo(user);
                sendJSONresponse(res, 200, {
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
                sendJSONresponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else if (req.file) {
                console.log('File!');
                const profilePicture = req.file;
                const filepath = path.join(__dirname, '../../', profilePicture.path);
                try {
                    const file = fs.readFileSync(filepath);
                    const extension = mime.getExtension(profilePicture.mimetype);
                    const mimeType = profilePicture.mimetype;
                    console.log('ProfilePicture', mimeType);
                    fs.unlinkSync(filepath);
                    ImagesController.postImage(`profile_pictures/profile_${user.username}.${extension}`, file, mimeType)
                        .then(result => {
                            user.profilePicture = result.url;
                            user.save(err => {
                                if (err) {
                                    sendJSONresponse(res, 500, {
                                        error: err
                                    });
                                } else {
                                    user = user.toObject();
                                    trimUserInfo(user);
                                    sendJSONresponse(res, 200, {
                                        data: user
                                    });
                                }
                            });
                        })
                        .catch(err => {
                            sendJSONresponse(res, 500, {
                                error: err
                            });
                        });
                } catch (e) {
                    sendJSONresponse(res, 404, {
                        error: err
                    });
                }
            } else {
                sendJSONresponse(res, 204, {
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
                sendJSONresponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                _.assign(user, req.body);
                console.log('Update');
                user.save(err => {
                    if (err) {
                        sendJSONresponse(res, 500, {
                            error: err
                        });
                    } else {
                        user = user.toObject();
                        trimUserInfo(user);
                        sendJSONresponse(res, 200, {
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
                sendJSONresponse(res, 404, {
                    error: err || 'User Not Found'
                });
            } else {
                user.remove(err => {
                    if (err) {
                        sendJSONresponse(res, 404, {
                            error: err || 'User Not Found'
                        });
                    } else {
                        sendJSONresponse(res, 200, {
                            data: `The user with the username ${user.username} was removed`
                        });
                    }
                });
            }
        });
    }
};

export default UserController;
