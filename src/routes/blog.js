

import express from 'express';
import bodyParser from 'body-parser';

import { auth, canUpdate, canPost } from '../config/jwt.config';

import BlogController from '../controllers/blog.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/blog route
router.route('/')
    .post(auth, canPost, BlogController.post.bind(BlogController))
    .get(BlogController.getAll.bind(BlogController));

router.route('/:id')
    .get(BlogController.get.bind(BlogController))
    .put(auth, canUpdate, BlogController.put.bind(BlogController))
    .post(auth, canUpdate, BlogController.postCoverPhoto.bind(BlogController))
    .delete(auth, canUpdate, BlogController.delete.bind(BlogController));

router.route('/tag/:tag')
    .get(BlogController.getByTag.bind(BlogController));

router.route('/title/:title')
    .get(BlogController.getByTitle.bind(BlogController));

export default router;
