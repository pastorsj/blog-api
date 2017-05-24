'use strict';

import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import './models/db.js';
import './models/blog.js';
import './models/user.js';

import blogRoute from './routes/blog';
import userRoute from './routes/user';
import auth from './routes/auth';

import passport from 'passport';
import session from 'express-session';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'random-secret1025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/blog', blogRoute);
app.use('/user', userRoute);

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
        res.status(err.status || 500);
        console.error(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.error(err);
});

export default app;
