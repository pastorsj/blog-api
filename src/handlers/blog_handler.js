'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');

/**
 * ROUTE: blog/:id
 */

const BlogHandler = {
    post: (req, res) => {
        mongoose.model('BlogPost').create(req.body, (err, blog) => {
            if (err) {
                res.status(500);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Blog Post Not Found'
                        });
                    }
                });
            } else {
                res.status(200);
                res.format({
                    json: () => {
                        res.json({
                            data: blog,
                            message: `Blog created by ${blog.author}`
                        });
                    }
                });
            }
        });
    },
    getAll: (req, res) => {
        mongoose.model('BlogPost').find({}, (err, posts) => {
            if (err || _.isEmpty(posts)) {
                res.status(500);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Blog Post Not Found'
                        });
                    }
                });
            } else {
                res.status(200);
                res.format({
                    json: () => {
                        res.json({
                            data: posts
                        });
                    }
                });
            }
        });
    },
    get: (req, res) => {
        mongoose.model('BlogPost').findOne({
            _id: req.params.id
        }, (err, blog) => {
            if (err || _.isEmpty(blog)) {
                res.status(500);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Blog Post Not Found'
                        });
                    }
                });
            } else {
                res.status(200);
                res.format({
                    json: () => {
                        res.json({
                            data: blog
                        });
                    }
                });
            }
        });
    },
    put: (req, res) => {
        mongoose.model('BlogPost').findOne({
            _id: req.params.id
        }, (err, blog) => {
            if (err || _.isEmpty(blog)) {
                res.status(404);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Blog Post Not Found'
                        });
                    }
                });
            } else {
                _.assign(blog, req.body);
                blog.save(err => {
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
                                    data: blog
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    delete: (req, res) => {
        mongoose.model('BlogPost').findOne({
            id: req.params.id
        }, (err, blog) => {
            if (err || _.isEmpty(blog)) {
                res.status(404);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Blog Post Not Found'
                        });
                    }
                });
            } else {
                blog.remove(err => {
                    if (err) {
                        res.status(404);
                        res.format({
                            json: () => {
                                res.json({
                                    error: err || 'Blog Post Not Found'
                                });
                            }
                        });
                    } else {
                        res.status(200);
                        res.format({
                            json: () => {
                                res.json(`The blog with the id ${blog._id} was removed`);
                            }
                        });
                    }
                });
            }
        });
    },
    getByTag: (req, res) => {
        mongoose.model('BlogPost').find({
            tags: {
                $elemMatch: req.params.tag
            }
        }, (err, posts) => {
            if (err || _.isEmpty(posts)) {
                res.status(404);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Blog Post Not Found'
                        });
                    }
                });
            } else {
                res.status(200);
                res.format({
                    json: () => {
                        res.json(posts);
                    }
                });
            }
        });
    }
};

export default BlogHandler;
