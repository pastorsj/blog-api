'use strict'

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const BlogHandler = require('../handlers/blog_handler')

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

// Availible via the base_url/blog route
router.route('/')
    .post(BlogHandler.post.bind(BlogHandler))

router.route('/:id')
    .get(BlogHandler.get.bind(BlogHandler))
    .put(BlogHandler.put.bind(BlogHandler))
    .delete(BlogHandler.delete.bind(BlogHandler))

modules.exports = router