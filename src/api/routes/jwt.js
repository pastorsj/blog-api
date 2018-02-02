import express from 'express';
import bodyParser from 'body-parser';

import AuthController from '../controllers/auth.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/jwt route
router.route('/expired')
    .post(AuthController.post.bind(AuthController));

export default router;
