'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import {config} from '../config';

import TagsController from '../controllers/tags.controller';

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

// Availible via the base_url/images route
router.route('/')
    .post(auth, TagsController.post.bind(TagsController))
    .put(auth, TagsController.getPrefixes.bind(TagsController))
    .get(auth, TagsController.getTagsByPopularity.bind(TagsController));

router.route('/:tag')
    .get(auth, TagsController.getArticleByTag.bind(TagsController));

export default router;
