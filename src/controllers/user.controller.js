'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';

/**
 * ROUTE: user/:username
 */

const UserController = {
    get: (req, res) => {
        mongoose.model('User').findOne({
            username: req.params.username
        }, (err, user) => {
            if (err || _.isEmpty(user)) {
                res.status(404);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'User Not Found'
                        });
                    }
                });
            } else {
                res.status(200);
                res.format({
                    json: () => {
                        res.json({
                            data: user
                        });
                    }
                });
            }
        });
    },
    put: function(req, res) {
        mongoose.model('User').findOne({
            username: req.params.username
        }, (err, user) => {
            if (err || _.isEmpty(user)) {
                res.status(404);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'User Not Found'
                        });
                    }
                });
            } else {
                _.assign(user, req.body);
                user.save(err => {
                    if (err) {
                        res.status(500);
                        res.format({
                            json: () => {
                                res.json({
                                    error: err
                                });
                            }
                        });
                    } else {
                        res.status(200);
                        res.format({
                            json: () => {
                                res.json({
                                    data: user
                                });
                            }
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
                res.status(404);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'User Not Found'
                        });
                    }
                });
            } else {
                user.remove(err => {
                    if (err) {
                        res.status(404);
                        res.format({
                            json: () => {
                                res.json({
                                    error: err || 'User Not Found'
                                });
                            }
                        });
                    } else {
                        res.status(200);
                        res.format({
                            json: () => {
                                res.json({
                                    data: `The user with the username ${user.username} was removed`
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

export default UserController;
