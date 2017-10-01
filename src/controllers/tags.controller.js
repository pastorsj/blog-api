'use strict';

import redis from 'redis';

const client = redis.createClient();
const setName = 'tags';

client.on('error', err => {
    console.error('Error ' + err);
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
                client.zadd(setName, 0, prefix);
            }
            client.zadd(setName, 0, tag + '*');
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
                let start = await zrank(setName, prefix);
    
                if (!start) {
                    start = await zrank(setName, prefix + "*");
                    if (!start) {
                        sendJSONResponse(res, 200, {
                            data: results
                        });
                    }
                }
    
                while (results.length !== count) {
                    let range = await zrange(setName, start, start + rangeLen - 1)
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
    }
};

export default TagsController;
