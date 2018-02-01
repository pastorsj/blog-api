import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';

import TagsController from '../controllers/tags.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/tags route
router.route('/')
    .post(auth, TagsController.post.bind(TagsController))
    .put(auth, TagsController.getPrefixes.bind(TagsController))
    .get(TagsController.getTagsByPopularity.bind(TagsController));

router.route('/:tag')
    .get(TagsController.getArticlesByTag.bind(TagsController));

export default router;
