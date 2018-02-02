import client from '../../config/redis.config';

const TagRepository = {
    /**
     * Promisify the zadd command
     * @param {String} setName - The name of the sorted set
     * @param {Number} start - The beginning of the sorted set
     * @param {String} prefix - The prefix of the string you want to check
     * @returns {Promise} - Either the zrank command command succeeds or fails
     */
    zadd: (setName, start, prefix) => new Promise((resolve, reject) => {
        client.zadd(setName, start, prefix, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    }),

    /**
     * Promisify the zrank command
     * @param {String} setName - The name of the sorted set
     * @param {String} prefix - The prefix of the string you want to check
     * @returns {Promise} - Either the zrank command command succeeds or fails
     */
    zrank: (setName, prefix) => new Promise((resolve, reject) => {
        client.zrank(setName, prefix, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    }),

    /**
     * Promisify the zrange command
     * @param {String} setName - The name of the sorted set
     * @param {Number} start - The beginning of the range
     * @param {Number} end - The end of the range
     * @returns {Promise} Either the zrange commands succeeds or fails
     */
    zrange: (setName, start, end) => new Promise((resolve, reject) => {
        if (!setName || !start || !end) {
            reject(new Error('Either the start or end is not defined'));
        } else {
            client.zrange(setName, start, end, (err, range) => {
                if (err) {
                    reject(err);
                }
                resolve(range);
            });
        }
    })
};

export default TagRepository;
