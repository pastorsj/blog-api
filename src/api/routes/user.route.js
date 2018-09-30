import express from 'express';
import bodyParser from 'body-parser';

import { auth } from '../../config/jwt.config';

import UserController from '../controllers/user.controller';
import AuthGuard from '../guards/auth.guard';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/user route
router.route('/:username')
    .get(UserController.get)
    .post(auth, AuthGuard.isAccessible, UserController.updateProfilePicture)
    .put(auth, AuthGuard.isAccessible, UserController.put)
    .delete(auth, AuthGuard.isAccessible, UserController.delete);

export default router;
