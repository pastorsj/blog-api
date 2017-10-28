

import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../config/jwt.config';

import ImagesController from '../controllers/images.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/images route
router.route('/gethash')
    .get(auth, ImagesController.get.bind(ImagesController));

router.route('/')
    .delete(auth, ImagesController.delete.bind(ImagesController));

export default router;
