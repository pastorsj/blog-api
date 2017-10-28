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

const Logger = winston.Logger;
const Console = winston.transports.Console;
const File = winston.transports.File;

const logger = new (Logger)({
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

logger.log = function (level, msg) {
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

export default logger;
