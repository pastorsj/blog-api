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
    .get(UserController.get)
    .post(auth, AuthController.isAccessible, UserController.updateProfilePicture)
    .put(auth, AuthController.isAccessible, UserController.put)
    .delete(auth, AuthController.isAccessible, UserController.delete);

export default router;
