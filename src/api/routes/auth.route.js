import express from 'express';
import bodyParser from 'body-parser';

import AuthController from '../controllers/auth.controller';
import { auth } from '../../config/jwt.config';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/auth route
router.route('/jwt/expired')
    .post(AuthController.validateJWT);

router.route('/login')
    .post(AuthController.login);

router.route('/register')
    .post(AuthController.register);

router.route('/token')
    .post(AuthController.refreshAccessToken);

router.route('/subscription')
    .post(auth, AuthController.addSubscription);


export default router;
