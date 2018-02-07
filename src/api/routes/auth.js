import express from 'express';
import bodyParser from 'body-parser';

import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/auth route
router.route('/jwt/expired')
    .post(AuthController.validateJWT.bind(AuthController));

router.route('/login')
    .post(AuthController.login.bind(AuthController));

router.route('/register')
    .post(AuthController.register.bind(AuthController));

router.route('/token')
    .post(AuthController.refreshAccessToken.bind(AuthController));


export default router;
