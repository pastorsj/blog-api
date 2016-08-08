'use strict'

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const LoginHandler = require('../handlers/login_handler')

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

// Availible via the base_url/login route
router.route('/')
    .get(LoginHandler.get.bind(LoginHandler))

modules.exports = router