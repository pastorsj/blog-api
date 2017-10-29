

import mongoose from 'mongoose';
import _ from 'lodash';

import ImageService from '../services/image.service';
import log from '../log';
import { upload } from '../config/multer.config';

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
        mongoose.model('User').find({ username: post.author }, { name: 1, username: 1 }).limit(1).exec((err, author) => {
            if (err || author.length < 1) {
                reject(err || 'No authors found');
            }
            const postObject = post.toObject();
            postObject.author = author.pop();
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
        upload.single('coverPhoto')(req, res, (fileError) => {
            if (fileError) {
                sendJSONResponse(res, 400, {
                    error: 'The file uploaded was larger than 1mb'
                });
            } else {
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
                        const { file } = req;
                        const path = `cover_photo/cover_${blog._id}`;
                        ImageService.postImage(file, path)
                            .then((result) => {
                                blog.coverPhoto = result.url; //eslint-disable-line
                                blog.save((error) => {
                                    if (error) {
                                        log.critical('Error while trying to save the blog with the new cover photo', err);
                                        sendJSONResponse(res, 500, {
                                            error
                                        });
                                    } else {
                                        sendJSONResponse(res, 200, {
                                            data: blog
                                        });
                                    }
                                });
                            })
                            .catch((error) => {
                                log.critical('Error while trying to post image', err);
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
                const postPromises = [];
                posts.forEach((post) => {
                    postPromises.push(retrieveAuthor(post));
                });
                Promise.all(postPromises)
                    .then((result) => {
                        sendJSONResponse(res, 200, {
                            data: result
                        });
                    })
                    .catch((error) => {
                        sendJSONResponse(res, 404, {
                            error
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
                blog.save((error) => {
                    if (err) {
                        sendJSONResponse(res, 400, {
                            error: error || 'Failed to save blog to the database'
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
                blog.remove((error) => {
                    if (err) {
                        sendJSONResponse(res, 404, {
                            error: error || 'Blog Post Not Found'
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
        const projection = {
            _id: 1,
            title: 1,
            tags: 1
        };
        const titlePrefix = req.params.title;
        mongoose.model('BlogPost').find({ title: { $regex: `^${titlePrefix}`, $options: 'i' } }, projection, (err, titles) => {
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
