import log from '../../log';
import TagRepository from '../../dal/repositories/tags.repository';

const RedisService = {
    addNew: (word, setName) => new Promise((resolve, reject) => {
        try {
            const adds = [];
            for (let i = 0; i < word.length; i += 1) {
                const prefix = word.slice(0, i);
                adds.push(TagRepository.zadd(setName, 0, prefix));
            }
            adds.push(TagRepository.zadd(setName, 0, `${word}*`));
            Promise.all(adds)
                .then(() => {
                    resolve('');
                })
                .catch((err) => {
                    log.error('An error occured while trying to add a prefix to the database', err);
                    reject(new Error('An error occured while trying to add a prefix to the database'));
                });
        } catch (e) {
            log.error('Failed to add new prefix/word', e);
            reject(new Error(e));
        }
    }),
    getPrefixes: (prefix, count, setName) => new Promise(async (resolve, reject) => {
        try {
            const results = [];
            const rangeLen = 50;
            if (!prefix || !count) {
                log.error(`Prefix or count was not included in the body of the request. Prefix: ${prefix}; Count: ${count}`);
                reject(new Error('Prefix or count was not included in the body of the request'));
            } else {
                let start = await TagRepository.zrank(setName, prefix);

                if (!start) {
                    start = await TagRepository.zrank(setName, `${prefix}*`);
                    if (!start) {
                        resolve(results);
                    }
                }

                while (results.length !== count) {
                    const range = await TagRepository.zrange(setName, start, start + (rangeLen - 1)); //eslint-disable-line
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
                resolve(results);
            }
        } catch (e) {
            log.error('Error while getting prefixes', e);
            reject(new Error(`An error has occured: ${e}`));
        }
    })
};

export default RedisService;
