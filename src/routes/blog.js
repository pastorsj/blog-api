'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import {config} from '../config';

import BlogController from '../controllers/blog.controller';

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

// Availible via the base_url/blog route
router.route('/')
    .post(auth, BlogController.post.bind(BlogController))
    .get(BlogController.getAll.bind(BlogController));

router.route('/:id')
    .get(BlogController.get.bind(BlogController))
    .put(auth, BlogController.put.bind(BlogController))
    .delete(auth, BlogController.delete.bind(BlogController));

router.route('/tag/:tag')
    .get(BlogController.getByTag.bind(BlogController));

router.route('/title/:title')
    .get(BlogController.getByTitle.bind(BlogController));

export default router;
