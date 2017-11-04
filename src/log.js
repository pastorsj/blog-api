import winston from 'winston';

// set default log level.
const logLevel = 'debug';

// Set up logger
const customColors = {
    trace: 'white',
    debug: 'green',
    info: 'blue',
    warning: 'yellow',
    critical: 'red',
    fatal: 'red'
};

const { Logger, transports: { Console, File } } = winston;

const logger = new (Logger)({
    name: 'console',
    colors: customColors,
    level: logLevel,
    levels: {
        fatal: 0,
        critical: 1,
        warning: 2,
        info: 3,
        debug: 4,
        trace: 5
    },
    transports: [
        new (Console)({
            colorize: true,
            timestamp: true
        }),
        new (File)({ filename: 'production.log' })
    ]
});

winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
const origLog = logger.log;

logger.log = function log(level, msg) {
    if (msg instanceof Error) {
        const args = Array.prototype.slice.call(arguments);
        args[1] = msg.stack;
        origLog.apply(logger, args);
    } else {
        origLog.apply(logger, arguments);
    }
};
/* LOGGER EXAMPLES
    var log = require('./log.js')
    log.trace('testing')
    log.debug('testing')
    log.info('testing')
    log.warning('testing')
    log.critical('testing')
    log.fatal('testing')
 */

if (process.env.NODE_ENV === 'TEST') {
    logger.transports.console.silent = true;
}

export default logger;
