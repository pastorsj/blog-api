'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import mime from 'mime';

import ImagesController from '../controllers/images.controller';

const sendJSONresponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * ROUTE: user/:username
 */

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
                sendJSONresponse(res, 200, {
                    data: user
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
                if (req.files.profilePicture) {
                    const profilePicture = req.files.profilePicture[0];
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
                    user.save(err => {
                        if (err) {
                            sendJSONresponse(res, 500, {
                                error: err
                            });
                        } else {
                            sendJSONresponse(res, 200, {
                                data: user
                            });
                        }
                    });
                }
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
