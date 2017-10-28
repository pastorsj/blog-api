

import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../config/jwt.config';
import { upload } from '../config/multer.config';
import useMethodOverride from './common/methodOverride.config';

import UserController from '../controllers/user.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(useMethodOverride());

// Availible via the base_url/user route
router.route('/:username')
    .get(UserController.get.bind(UserController))
    .post(auth, upload.single('profilePicture'), UserController.post.bind(UserController))
    .put(auth, UserController.put.bind(UserController))
    .delete(auth, UserController.delete.bind(UserController));

module.exports = router;
