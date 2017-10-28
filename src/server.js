

import http from 'http';
import spdy from 'spdy';
import fs from 'fs';
import yargs from 'yargs';

import app from './app';
import log from './log';

const { type, portArg } = yargs.argv;


/**
 * Normalize a port into a number, string, or false.
 * @param {string} val - The port in string form
 * @returns {Number | boolean} - The port in Number form if allowed or false
 */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (Number.isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 * @param {Object} error - The object containing the error
 * @param {Number} port - The port to listen to
 */
function onError(error, port) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        log.fatal(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
    case 'EADDRINUSE':
        log.fatal(`${bind} is already in use`);
        process.exit(1);
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 * @param {Object} server - The server object used for http connections
 */
function onListening(server) {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    log.info(`Http server listening on ${bind}`);
}

/**
 *
 * @param {Object} httpsServer - The server object used for https connections
 */
function onListeningHttps(httpsServer) {
    const addr = httpsServer.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    log.info(`Https server listening on ${bind}`);
}

/**
 * Creates an http server
 * @param {Number} httpPort - The port for http
 */
function createHttpServer(httpPort = 3000) {
    const port = normalizePort(process.env.HTTP_PORT || httpPort);
    const server = http.createServer(app);

    app.set('port', port);

    server.listen(port);
    server.on('error', onError.bind(null, port));
    server.on('listening', onListening.bind(null, server));
}

/**
 * Creates an https server
 * @param {Number} httpsPort - The port for https
 */
function createHttpsServer(httpsPort = 3001) {
    const privateKey = fs.readFileSync(process.env.PRIVATE_KEY, 'utf8');
    const certificate = fs.readFileSync(process.env.CERTIFICATE, 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const port = normalizePort(process.env.HTTPS_PORT || httpsPort);
    const http2Server = spdy.createServer(credentials, app);

    app.set('httpsPort', port);

    http2Server.listen(port);
    http2Server.on('error', onError.bind(null, port));
    http2Server.on('listening', onListeningHttps.bind(null, http2Server));
}

if (type === 'https') {
    createHttpsServer(portArg);
} else if (type === 'http') {
    createHttpServer(portArg);
} else {
    createHttpServer();
    createHttpsServer();
}
