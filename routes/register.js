'use strict'

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const RegisterHandler = require('../handlers/register_handler')

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

// Availible via the base_url/register route
router.route('/')
    .get(RegisterHandler.get.bind(RegisterHandler))
    .post(RegisterHandler.register.bind(RegisterHandler))

modules.exports = router