'use strict';

import mongoose from 'mongoose';
import _ from 'lodash';

import ImageService from '../services/image.service';
import log from '../log';

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * Retrieves the full author for a blog post
 * @param {Object} post - A blog post 
 * @returns {Promise} - Either it returns the updated post or an error
 */
function retrieveAuthor(post) {
    return new Promise((resolve, reject) => {
        mongoose.model('User').find({username: post.author}, {name: 1, username: 1}).limit(1).exec((err, author) => {
            if (err || author.length < 1) {
                reject(err || 'No authors found');
            }
            const postObject = post.toObject();
            postObject.author = author[0];
            resolve(postObject);
        });
    });
}

/**
 * ROUTE: blog/:id
 */

const BlogController = {
    post: (req, res) => {
        mongoose.model('BlogPost').create(req.body, (err, blog) => {
            if (err) {
                sendJSONResponse(res, 500, {
                    error: err || 'Blog Post Not Found'
                });
            } else {
                sendJSONResponse(res, 200, {
                    data: blog,
                    message: `Blog created by ${blog.author}`
                });
            }
        });
    },
    postCoverPhoto: (req, res) => {
        mongoose.model('BlogPost').findOne({
            _id: req.params.id
        }, (err, blog) => {
            log.debug('Blog', blog);
            log.debug('File?', req.file);
            if (err || _.isEmpty(blog)) {
                sendJSONResponse(res, 404, {
                    error: err || 'Article Not Found'
                });
            } else if (req.file) {
                const file = req.file;
                const path = `cover_photo/cover_${blog._id}`;
                ImageService.postImage(file, path)
                    .then(result => {
                        blog.coverPhoto = result.url;
                        blog.save(err => {
                            if (err) {
                                log.critical('Error while trying to save the blog with the new cover photo', err);
                                sendJSONResponse(res, 500, {
                                    error: err
                                });
                            } else {
                                sendJSONResponse(res, 200, {
                                    data: blog
                                });
                            }
                        });
                    })
                    .catch(err => {
                        log.critical('Error while trying to post image', err);
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
    getAll: (req, res) => {
        mongoose.model('BlogPost').find({}, (err, posts) => {
            if (err) {
                sendJSONResponse(res, 404, {
                    error: err || 'Blog Post Not Found'
                });
            } else {
                let postPromises = [];
                posts.forEach(post => {
                    postPromises.push(retrieveAuthor(post));
                });
                Promise.all(postPromises)
                    .then(result => {
                        sendJSONResponse(res, 200, {
                            data: result
                        });
                    })
                    .catch(err => {
                        sendJSONResponse(res, 404, {
                            error: err
                        });
                    });
            }
        });
    },
    get: (req, res) => {
        mongoose.model('BlogPost').findOne({
            _id: req.params.id
        }, (err, blog) => {
            if (err || _.isEmpty(blog)) {
                sendJSONResponse(res, 404, {
                    error: err || 'Blog Post Not Found'
                });
            } else {
                sendJSONResponse(res, 200, {
                    data: blog
                });
            }
        });
    },
    put: (req, res) => {
        mongoose.model('BlogPost').findOne({
            _id: req.params.id
        }, (err, blog) => {
            if (err || _.isEmpty(blog)) {
                sendJSONResponse(res, 404, {
                    error: err || 'Blog Post Not Found'
                });
            } else {
                _.assign(blog, req.body);
                blog.save(err => {
                    if (err) {
                        sendJSONResponse(res, 400, {
                            error: err || 'Failed to save blog to the database'
                        });
                    } else {
                        sendJSONResponse(res, 200, {
                            data: blog
                        });
                    }
                });
            }
        });
    },
    delete: (req, res) => {
        mongoose.model('BlogPost').findOne({
            _id: req.params.id
        }, (err, blog) => {
            if (err || _.isEmpty(blog)) {
                sendJSONResponse(res, 404, {
                    error: err || 'Blog Post Not Found'
                });
            } else {
                blog.remove(err => {
                    if (err) {
                        sendJSONResponse(res, 404, {
                            error: err || 'Blog Post Not Found'
                        });
                    } else {
                        sendJSONResponse(res, 200, {
                            data: `The blog with the id ${blog._id} was removed`
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
                sendJSONResponse(res, 404, {
                    error: err || 'Blog Post Not Found'
                });
            } else {
                sendJSONResponse(res, 200, {
                    data: posts
                });
            }
        });
    },
    getByTitle: (req, res) => {
        const titlePrefix = req.params.title;
        mongoose.model('BlogPost').find({title: {$regex: '^' + titlePrefix, $options: 'i'}}, {_id: 1, title: 1, tags: 1}, (err, titles) => {
            if (err) {
                sendJSONResponse(res, 404, {
                    error: err || 'No articles with the title found'
                });
            } else {
                sendJSONResponse(res, 200, {
                    data: titles
                });
            }
        });
    }
};

export default BlogController;
