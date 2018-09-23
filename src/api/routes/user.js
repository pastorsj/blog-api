import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';

import UserController from '../controllers/user.controller';
import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/user route
router.route('/:username')
    .get(UserController.get.bind(UserController))
    .post(auth, AuthController.isAccessible, UserController.updateProfilePicture.bind(UserController))
    .put(auth, AuthController.isAccessible, UserController.put.bind(UserController))
    .delete(auth, AuthController.isAccessible, UserController.delete.bind(UserController));

export default router;
