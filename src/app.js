'use strict';

import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';

import './models/db';
import './models/blog';
import './models/user';

import blogRoute from './routes/blog';
import userRoute from './routes/user';
import articlesRoute from './routes/articles';
import imagesRoute from './routes/images';
import jwtRoute from './routes/jwt';
import gistRoute from './routes/gist';
import tagsRoute from './routes/tags';

import {register, login} from './routes/auth';

import passport from 'passport';
import session from 'express-session';

import helmet from 'helmet';

const app = express();

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

app.use(session({
    secret: 'random-secret1025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}));

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/register', register);
app.use('/api/login', login);

app.use('/api/blog', blogRoute);
app.use('/api/user', userRoute);
app.use('/api/articles', articlesRoute);
app.use('/api/images', imagesRoute);
app.use('/api/jwt', jwtRoute);
app.use('/api/gist', gistRoute);
app.use('/api/tags', tagsRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send({error: err});
        } else {
            res.status(err.status || 500);
        }
        console.error(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({error: err});
    } else {
        res.status(err.status || 500);
    }
    console.error(err);
});

export default app;
