import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';

import GistController from '../controllers/gist.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/gist route
router.route('/')
    .post(auth, GistController.post.bind(GistController));

export default router;
