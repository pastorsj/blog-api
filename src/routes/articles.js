'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import {config} from '../config';

import ArticlesHandler from '../handlers/articles_handler';

const router = express.Router();

const auth = jwt({
    secret: config.secret,
    /* req.payload contains the payload of the decoded token */
    userProperty: 'payload'
});

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(methodOverride(function(req, res) {
    const method = req.body._method;
    if (req.body && typeof req.body.toString() === 'object' && '_method' in req.body) {
        delete req.body._method;
    }
    return method;
}));

// Availible via the base_url/article route
router.route('/:username')
    .get(auth, ArticlesHandler.get.bind(ArticlesHandler));

export default router;
