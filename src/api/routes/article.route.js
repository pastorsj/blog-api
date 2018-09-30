import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';

import ArticleController from '../controllers/article.controller';
import AuthController from '../controllers/auth.controller';
import AuthGuard from '../guards/auth.guard';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/article route
router.route('/')
    .post(auth, AuthGuard.canPost, ArticleController.createArticle)
    .get(ArticleController.getAllPublishedArticles);

router.route('/:id')
    .get(ArticleController.getArticleById)
    .put(auth, AuthGuard.canUpdate, ArticleController.updateArticle)
    .post(auth, AuthGuard.canUpdate, ArticleController.postCoverPhoto)
    .delete(auth, AuthGuard.canUpdate, ArticleController.deleteArticle);

router.route('/tag/:tag')
    .get(ArticleController.getByTag);

router.route('/title/:title')
    .get(ArticleController.getByTitle);

router.route('/author/:username')
    .get(auth, AuthGuard.isAccessible, ArticleController.getAllArticlesByAuthor);

export default router;
