import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';
import ArticlesController from '../controllers/articles.controller';
import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/articles route
router.route('/:username')
    .get(auth, AuthController.isAccessible, ArticlesController.get.bind(ArticlesController));

export default router;
