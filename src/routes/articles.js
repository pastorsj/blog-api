

import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../config/jwt.config';
import ArticlesController from '../controllers/articles.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/article route
router.route('/:username')
    .get(auth, ArticlesController.get.bind(ArticlesController));

export default router;
