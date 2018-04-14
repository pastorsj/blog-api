import redis from 'redis';
import log from '../log';

const redisConf = {
    host: process.env.REDIS,
    password: process.env.REDIS_PASSWORD
};

const client = process.env.REDIS ? redis.createClient(redisConf) : redis.createClient();

client.on('error', (err) => {
    log.critical(`Error ${err}`);
});

export default client;
