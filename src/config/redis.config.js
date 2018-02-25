import redis from 'redis';
import log from '../log';

const client = process.env.REDIS ? redis.createClient({ host: process.env.REDIS }) : redis.createClient();

client.on('error', (err) => {
    log.critical(`Error ${err}`);
});

export default client;
