'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import jwt from 'express-jwt';
import {config} from '../config';

import UserController from '../controllers/user.controller';

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
    .get(UserController.get.bind(UserController))
    .put(auth, UserController.put.bind(UserController))
    .delete(auth, UserController.delete.bind(UserController));

module.exports = router;
