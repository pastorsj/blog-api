

import express from 'express';
import bodyParser from 'body-parser';

import JwtController from '../controllers/jwt.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

// Availible via the base_url/jwt route
router.route('/expired')
    .post(JwtController.post.bind(JwtController));

export default router;
