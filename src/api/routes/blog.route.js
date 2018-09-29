import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';

import BlogController from '../controllers/blog.controller';
import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/blog route
router.route('/')
    .post(auth, AuthController.canPost, BlogController.post)
    .get(BlogController.getAll);

router.route('/:id')
    .get(BlogController.get)
    .put(auth, AuthController.canUpdate, BlogController.put)
    .post(auth, AuthController.canUpdate, BlogController.postCoverPhoto)
    .delete(auth, AuthController.canUpdate, BlogController.delete);

router.route('/tag/:tag')
    .get(BlogController.getByTag);

router.route('/title/:title')
    .get(BlogController.getByTitle);

export default router;
