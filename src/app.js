import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';
import compression from 'compression';
import expressWinston from 'express-winston';
import winston from 'winston';
import limiter from 'express-limiter';
import mongoose from 'mongoose';

import './dal/models/db';
import './dal/models/blog';
import './dal/models/user';

import blogRoute from './api/routes/blog';
import userRoute from './api/routes/user';
import articlesRoute from './api/routes/articles';
import imagesRoute from './api/routes/images';
import gistRoute from './api/routes/gist';
import tagsRoute from './api/routes/tags';
import graphqlRoute from './api/routes/graphql';
import authRoute from './api/routes/auth';

import client from './config/redis.config';
import log from './log';

mongoose.Promise = global.Promise;

const app = express();

const limiterApp = limiter(app, client);
limiterApp({
    lookup: ['connection.remoteAddress'],
    total: 100,
    expire: 1000 * 60 * 60
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}));
app.use(helmet());
app.use(compression());

app.use(session({
    secret: 'random-secret1025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}));

if (process.env.NODE_ENV !== 'TEST') {
    app.use(expressWinston.logger({
        transports: [
            new winston.transports.Console({
                colorize: true
            })
        ],
        requestFilter: (req, propName) => {
            if (propName === 'headers') {
                return Object.keys(req.headers).reduce((filteredHeaders, key) => {
                    const headers = filteredHeaders;
                    if (key !== 'authorization') {
                        headers[key] = req.headers[key];
                    }
                    return headers;
                }, {});
            }
            return req[propName];
        },
        expressFormat: true
    }));
}

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use('/api/blog', blogRoute);
app.use('/api/user', userRoute);
app.use('/api/articles', articlesRoute);
app.use('/api/images', imagesRoute);
app.use('/api/gist', gistRoute);
app.use('/api/tags', tagsRoute);
app.use('/api/auth', authRoute);

app.use('/graphql', graphqlRoute);

if (process.env.NODE_ENV !== 'TEST') {
    app.use(expressWinston.errorLogger({
        transports: [
            new winston.transports.Console({
                colorize: true
            })
        ]
    }));
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send({ error: err });
        } else {
            res.status(err.status || 500);
        }
        log.critical(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({ error: err });
    } else {
        res.status(err.status || 500);
    }
    log.critical(err);
});

export default app;
