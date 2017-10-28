

import express from 'express';
import bodyParser from 'body-parser';

import useMethodOverride from './common/methodOverride.config';
import JwtController from '../controllers/jwt.controller';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(useMethodOverride());

// Availible via the base_url/expired route
router.route('/expired')
    .post(JwtController.post.bind(JwtController));

export default router;
