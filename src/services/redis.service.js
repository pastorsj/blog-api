
import client from '../config/redis.config';

/**
 * Promisify the zadd command
 * @param {String} setName - The name of the sorted set
 * @param {Number} start - The beginning of the sorted set
 * @param {String} prefix - The prefix of the string you want to check
 * @returns {Promise} - Either the zrank command command succeeds or fails
 */
function zadd(setName, start, prefix) {
    return new Promise((resolve, reject) => {
        try {
            client.zadd(setName, start, prefix, (err, result) => {
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

/**
 * Promisify the zrank command
 * @param {String} setName - The name of the sorted set
 * @param {String} prefix - The prefix of the string you want to check
 * @returns {Promise} - Either the zrank command command succeeds or fails
 */
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

/**
 * Promisify the zrange command
 * @param {String} setName - The name of the sorted set
 * @param {Number} start - The beginning of the range
 * @param {Number} end - The end of the range
 * @returns {Promise} Either the zrange commands succeeds or fails
 */
function zrange(setName, start, end) {
    return new Promise((resolve, reject) => {
        try {
            if (!setName || !start || !end) {
                reject(new Error('Either the start or end is not defined'));
            }
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

const RedisService = {
    addNew: (word, setName) => new Promise((resolve, reject) => {
        try {
            const adds = [];
            for (let i = 0; i < word.length; i += 1) {
                const prefix = word.slice(0, i);
                adds.push(zadd(setName, 0, prefix));
            }
            adds.push(zadd(setName, 0, `${word}*`));
            Promise.all(adds)
                .then(() => {
                    resolve({
                        status: 204,
                        data: ''
                    });
                })
                .catch((err) => {
                    log.critical('An error occured while trying to add a prefix to the database', err);
                    reject(new Error('An error occured while trying to add a prefix to the database'));
                });
        } catch (e) {
            log.critical('Failed to add new prefix/word', e);
            reject(new Error(e));
        }
    }),
    getPrefixes: (prefix, count, setName) => new Promise(async (resolve, reject) => {
        try {
            const results = [];
            const rangeLen = 50;
            if (!prefix || !count) {
                log.critical(`Prefix or count was not included in the body of the request. Prefix: ${prefix}; Count: ${count}`);
                reject(new Error('Prefix or count was not included in the body of the request'));
            } else {
                let start = await zrank(setName, prefix);

                if (!start) {
                    start = await zrank(setName, `${prefix}*`);
                    if (!start) {
                        resolve({
                            status: 200,
                            data: results
                        });
                    }
                }

                while (results.length !== count) {
                    const range = await zrange(setName, start, start + (rangeLen - 1));
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
                resolve({
                    status: 200,
                    data: results
                });
            }
        } catch (e) {
            log.critical('Error while getting prefixes', e);
            reject(new Error(`An error has occured: ${e}`));
        }
    })
};

export default RedisService;
