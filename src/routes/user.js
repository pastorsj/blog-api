

import express from 'express';
import bodyParser from 'body-parser';

import { auth, isAccessible } from '../config/jwt.config';

import UserController from '../controllers/user.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/user route
router.route('/:username')
    .get(UserController.get.bind(UserController))
    .post(auth, isAccessible, UserController.updateProfilePicture.bind(UserController))
    .put(auth, isAccessible, UserController.put.bind(UserController))
    .delete(auth, isAccessible, UserController.delete.bind(UserController));

module.exports = router;
