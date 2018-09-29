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
    .post(auth, TagsController.post)
    .put(auth, TagsController.getPrefixes)
    .get(TagsController.getTagsByPopularity);

router.route('/:tag')
    .get(TagsController.getArticlesByTag);

export default router;
