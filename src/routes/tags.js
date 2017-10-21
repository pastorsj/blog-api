'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import {SECRET} from '../config/mongo.config';

import TagsController from '../controllers/tags.controller';

const router = express.Router();

const auth = jwt({
    secret: SECRET,
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

// Availible via the base_url/tags route
router.route('/')
    .post(auth, TagsController.post.bind(TagsController))
    .put(auth, TagsController.getPrefixes.bind(TagsController))
    .get(TagsController.getTagsByPopularity.bind(TagsController));

router.route('/:tag')
    .get(TagsController.getArticlesByTag.bind(TagsController));

export default router;
