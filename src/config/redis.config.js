import redis from 'redis';
import log from '../log';

const client = redis.createClient();

client.on('error', (err) => {
    log.critical(`Error ${err}`);
});

export default client;
