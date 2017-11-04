

import mongoose from 'mongoose';

import redis from '../services/redis.service';

const SET_NAME = 'tags';

const sendJSONResponse = (res, status, content = {}) => {
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
 * ROUTE: tags/
 */

const TagsController = {
    post: (req, res) => {
        const { tag } = req.body;
        redis.addNew(tag, SET_NAME)
            .then((result) => {
                sendJSONResponse(res, result.status, {
                    data: result.data
                });
            }).catch((err) => {
                sendJSONResponse(res, 400, {
                    error: err
                });
            });
    },
    getPrefixes: async (req, res) => {
        const { prefix, count } = req.body;
        redis.getPrefixes(prefix, count, SET_NAME)
            .then((result) => {
                sendJSONResponse(res, result.status, {
                    data: result.data
                });
            }).catch((err) => {
                sendJSONResponse(res, 400, {
                    error: err
                });
            });
    },
    getTagsByPopularity: (req, res) => {
        try {
            mongoose.model('BlogPost').find({ isPublished: true }, { tags: 1, _id: 0 }, (err, tagSet) => {
                if (err) {
                    sendJSONResponse(res, 404, {
                        error: err || 'Blog Post Not Found'
                    });
                } else {
                    const allTags = {};
                    tagSet.forEach((set) => {
                        const { tags } = set;
                        tags.forEach((tag) => {
                            allTags[tag] = allTags[tag] ? allTags[tag] + 1 : 1;
                        });
                    });
                    sendJSONResponse(res, 200, {
                        data: allTags
                    });
                }
            });
        } catch (e) {
            sendJSONResponse(res, 500, {
                error: `Error!${e}`
            });
        }
    },
    getArticlesByTag: (req, res) => {
        try {
            const { tag } = req.params;
            mongoose.model('BlogPost').find({
                tags: tag,
                isPublished: true
            }, (err, posts) => {
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
        } catch (e) {
            sendJSONResponse(res, 500, {
                error: `Error!${e}`
            });
        }
    }
};

export default TagsController;
