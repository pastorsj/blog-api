import winston from 'winston';

// set default log level.
const logLevel = 'info';

// Set up logger
const customColors = {
    trace: 'white',
    debug: 'green',
    info: 'blue',
    warn: 'yellow',
    crit: 'red',
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
        crit: 1,
        warn: 2,
        info: 3,
        debug: 4,
        trace: 5
    },
    transports: [
        new (Console)({
            colorize: true,
            timestamp: true
        }),
        new (File)({filename: 'out-prod.log'})
    ]
});

winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
var origLog = logger.log;

logger.log = function(level, msg) {
    if (msg instanceof Error) {
        var args = Array.prototype.slice.call(arguments);
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
    log.warn('testing')
    log.crit('testing')
    log.fatal('testing')
 */

export default logger;
