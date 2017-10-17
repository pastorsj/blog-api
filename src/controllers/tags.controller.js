'use strict';

import redis from 'redis';
import log from '../log';
import mongoose from 'mongoose';

const client = redis.createClient();
const SET_NAME = 'tags';

client.on('error', err => {
    log.critical('Error ' + err);
});

const sendJSONResponse = (res, status, content = {}) => {
    res.status(status);
    res.json(content);
};

function zrank(setName, prefix) {
    return new Promise((resolve, reject) => {
        try {
            client.zrank(setName, prefix, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        } catch (e) {
            reject(e);
        }
    });
}

function zrange(setName, start, end) {
    return new Promise((resolve, reject) => {
        try {
            client.zrange(setName, start, end, (err, range) => {
                if (err) {
                    reject(err);
                }
                resolve(range);
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * ROUTE: tags/
 */

const TagsController = {
    post: (req, res) => {
        try {
            const tag = req.body.tag;
            for (let i = 0; i < tag.length; i++) {
                const prefix = tag.slice(0, i);
                client.zadd(SET_NAME, 0, prefix);
            }
            client.zadd(SET_NAME, 0, tag + '*');
            sendJSONResponse(res, 204, {
                data: 'Successfully added tag'
            });
        } catch (e) {
            sendJSONResponse(res, 500, {
                error: 'Error!' + e
            });
        }
    },
    getPrefixes: async (req, res) => {
        try {
            const results = [];
            const rangeLen = 50;
            const prefix = req.body.prefix;
            let count = req.body.count;
            if (!prefix || !count) {
                sendJSONResponse(res, 400, {
                    data: 'Prefix or count was not included in the body of the request'
                });
            } else {
                let start = await zrank(SET_NAME, prefix);
    
                if (!start) {
                    start = await zrank(SET_NAME, prefix + "*");
                    if (!start) {
                        sendJSONResponse(res, 200, {
                            data: results
                        });
                    }
                }
    
                while (results.length !== count) {
                    let range = await zrange(SET_NAME, start, start + rangeLen - 1)
                    start += rangeLen;
                    if (!range || range.length === 0) {
                        break;
                    }
                    // eslint-disable-next-line
                    range.forEach((entry, index) => {
                        const minLength = Math.min(entry.length, prefix.length);
                        if (entry.slice(0, minLength) !== prefix.slice(0, minLength)) {
                            count = results.length;
                            return;
                        }
                        if (entry.slice(-1) === '*' && results.length !== count) {
                            results.push(entry.slice(0, -1));
                        }
                    });
                }
                sendJSONResponse(res, 200, {
                    data: results
                });
            }
        } catch (e) {
            sendJSONResponse(res, 500, {
                error: 'Error!' + e
            });
        }
    },
    getTagsByPopularity: (req, res) => {
        try {
            mongoose.model('BlogPost').find({}, {tags: 1, _id: 0}, (err, tagSet) => {
                if (err) {
                    sendJSONResponse(res, 404, {
                        error: err || 'Blog Post Not Found'
                    });
                } else {
                    const allTags = {};
                    tagSet.forEach((set) => {
                        const tags = set.tags;
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
                error: 'Error!' + e
            });
        }
    },
    getArticleByTag: (req, res) => {
        try {
            const tag = req.params.tag;
            mongoose.model('BlogPost').find({
                tags: tag
            }, (err, posts) => {
                if (err) {
                    sendJSONResponse(res, 404, {
                        error: err || 'Blog Post Not Found'
                    });
                } else {
                    sendJSONResponse(res, 200, {
                        data: posts
                    });
                }
            });
        } catch (e) {
            sendJSONResponse(res, 500, {
                error: 'Error!' + e
            });
        }
    }
};

export default TagsController;
