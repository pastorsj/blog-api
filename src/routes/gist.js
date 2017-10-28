

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import { SECRET } from '../config/mongo.config';

import GistController from '../controllers/gist.controller';

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

// Availible via the base_url/gist route
router.route('/')
    .post(auth, GistController.post.bind(GistController));

export default router;
