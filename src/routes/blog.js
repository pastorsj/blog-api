'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import BlogHandler from '../handlers/blog_handler';

const router = express.Router();

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
    .post(BlogHandler.post.bind(BlogHandler))
    .get(BlogHandler.getAll.bind(BlogHandler));

router.route('/:id')
    .get(BlogHandler.get.bind(BlogHandler))
    .put(BlogHandler.put.bind(BlogHandler))
    .delete(BlogHandler.delete.bind(BlogHandler));

router.route('/tag/:tag')
    .get(BlogHandler.getByTag.bind(BlogHandler));


export default router;
