import winston from 'winston';

const config = {
    levels: {
        error: 0,
        debug: 1,
        warn: 2,
        data: 3,
        info: 4,
        verbose: 5,
        silly: 6,
        custom: 7
    },
    colors: {
        error: 'red',
        debug: 'blue',
        warn: 'yellow',
        data: 'grey',
        info: 'green',
        verbose: 'cyan',
        silly: 'magenta',
        custom: 'yellow'
    }
};

winston.addColors(config.colors);

const alignedWithColorsAndTime = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => {
        const {
            timestamp, level, message, ...args
        } = info;

        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    }),
);

const logger = winston.createLogger({
    levels: config.levels,
    format: alignedWithColorsAndTime,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'production.log' })
    ]
});

/* LOGGER EXAMPLES
    var log = require('./log.js')
    log.data('testing')
    log.debug('testing')
    log.info('testing')
    log.warn('testing')
    log.error('testing')
 */

if (process.env.NODE_ENV === 'TEST') {
    logger.silent = true;
}

export default logger;
