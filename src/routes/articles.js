

import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../config/jwt.config';
import useMethodOverride from './common/methodOverride.config';
import ArticlesController from '../controllers/articles.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(useMethodOverride);

// Availible via the base_url/article route
router.route('/:username')
    .get(auth, ArticlesController.get.bind(ArticlesController));

export default router;
