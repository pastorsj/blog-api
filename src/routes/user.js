'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import {config} from '../config';

import UserHandler from '../handlers/user_handler';

const router = express.Router();

router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(methodOverride(function(req, res) {
    const method = req.body._method;
    if (req.body && typeof req.body.toString() === 'object' && '_method' in req.body) {
        delete req.body._method;
    }
    return method;
}));

const auth = jwt({
    secret: config.secret,
    /* req.payload contains the payload of the decoded token */
    userProperty: 'payload'
});

// Availible via the base_url/user route
router.route('/:username')
    .get(UserHandler.get.bind(UserHandler))
    .put(auth, UserHandler.put.bind(UserHandler))
    .delete(auth, UserHandler.delete.bind(UserHandler));

module.exports = router;
