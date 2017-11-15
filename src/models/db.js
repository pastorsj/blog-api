import mongoose from 'mongoose';
import readLine from 'readline';
import autoIncrement from 'mongoose-auto-increment';

import { DATABASE } from '../config/mongo.config';
import log from '../log';

const dbUri = DATABASE;
const connection = mongoose.connect(dbUri, {
    useMongoClient: true
});

autoIncrement.initialize(connection);

/*  Emulateing disconnection events on Windows */

if (process.platform === 'win32') {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', () => {
        process.emit('SIGINT');
    });
}

/*  CONNECTION EVENTS
    Monirtoring for successful connection through Mongoose
*/
mongoose.connection.on('connected', () => {
    log.info(`Mongoose connected to ${dbUri}`);
});

/*  Checking for connection error */
mongoose.connection.on('error', (err) => {
    log.info(`Mongoose connection error ${err}`);
});

/*  Checking for disconnection event */
mongoose.connection.on('disconnected', () => {
    log.info('Mongoose is disconnected');
});

/*  CAPTURE APP TERMINATION / RESTART EVENTS */
const gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        log.info(`Mongoose disconnection through ${msg}`);
        callback();
    });
};

/*  For app termination */
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});

/*  Listens for SIGUSR2, which is what nodemon uses when it restarts app */
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.exit();
    });
});

/* For Heroku app termination */
process.on('SIGTERM', () => {
    gracefulShutdown('App termination', () => {
        process.exit(0);
    });
});
