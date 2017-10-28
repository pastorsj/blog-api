

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import { SECRET } from '../config/mongo.config';

import ArticlesController from '../controllers/articles.controller';

const router = express.Router();

const auth = jwt({
    secret: SECRET,
    /* req.payload contains the payload of the decoded token */
    userProperty: 'payload'
});

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(methodOverride((req, res) => {
    const method = req.body._method;
    if (req.body && typeof req.body.toString() === 'object' && '_method' in req.body) {
        delete req.body._method;
    }
    return method;
}));

// Availible via the base_url/article route
router.route('/:username')
    .get(auth, ArticlesController.get.bind(ArticlesController));

export default router;
