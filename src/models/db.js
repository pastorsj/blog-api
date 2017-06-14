import mongoose from 'mongoose';
import {config} from '../config';       // get our config file
import autoIncrement from 'mongoose-auto-increment';

let gracefulShutdown;
const dbUri = config.database;
var connection = mongoose.connect(dbUri);

autoIncrement.initialize(connection);

/*  Emulateing disconnection events on Windows */
import readLine from 'readline';
if (process.platform === "win32") {
    let rl = readLine.createInterface({
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
    console.log(`Mongoose connected to ${dbUri}`);
});

/*  Checking for connection error */
mongoose.connection.on('error', err => {
    console.log(`Mongoose connection error ${err}`);
});

/*  Checking for disconnection event */
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected');
});

/*  CAPTURE APP TERMINATION / RESTART EVENTS */
gracefulShutdown = (msg, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnection through ${msg}`);
        callback();
    });
};

/*  For app termination */
process.on('SIGINT', () => {
    gracefulShutdown("app termination", () => {
        process.exit(0);
    });
});

/*  Listens for SIGUSR2, whih is hat nodemon uses when it restarts app */
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon reatart', () => {
        process.kill(process.id, 'SIGUSR2');
    });
});

/* For Heroku app termination */
process.on('SIGTERM', () => {
    gracefulShutdown('App termination', () => {
        process.exit(0);
    });
});
