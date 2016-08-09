'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');

/**
 * ROUTE: blog/:id
 */

const BlogHandler = {
  post: function(req, res) {
    mongoose.model('BlogPost').create(req.body, (err, blog) => {
      if (err) {
        res.status(500);
        res.format({
          json: () => {
            res.json({error: err || 'Blog Post Not Found'});
          }
        });
      } else {
        res.status(200);
        res.format({
          json: () => {
            res.json({message: `Blog created by ${blog.author}`});
          }
        });
      }
    });
  },
  getAll: function(req, res) {
    mongoose.model('BlogPost').find({}, (err, posts) => {
      if (err || _.isEmpty(posts)) {
        res.status(500);
        res.format({
          json: () => {
            res.json({error: err || 'Blog Post Not Found'});
          }
        });
      } else {
        res.status(200);
        res.format({
          json: () => {
            res.json(posts);
          }
        });
      }
    });
  },
  get: function(req, res) {
    mongoose.model('BlogPost').findOne({
      _id: req.params.id
    }, (err, blog) => {
      if (err || _.isEmpty(blog)) {
        res.status(500);
        res.format({
          json: () => {
            res.json({error: err || 'Blog Post Not Found'});
          }
        });
      } else {
        res.status(200);
        res.format({
          json: () => {
            res.json(blog);
          }
        });
      }
    });
  },
  put: function(req, res) {
    mongoose.model('BlogPost').findOne({
      _id: req.params.id
    }, (err, blog) => {
      if (err || _.isEmpty(blog)) {
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err || 'Blog Post Not Found'});
          }
        });
      } else {
        _.assign(blog, req.body);
        blog.save(function(err) {
          if (err) {
            res.status(500);
            res.format({
              json: () => {
                res.json({error: err});
              }
            });
          } else {
            res.status(200);
            res.format({
              json: () => {
                res.json(blog);
              }
            });
          }
        });
      }
    });
  },
  delete: function(req, res) {
    mongoose.model('BlogPost').findOne({
      _id: req.params.id
    }, (err, blog) => {
      if (err || _.isEmpty(blog)) {
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err || 'Blog Post Not Found'});
          }
        });
      } else {
        blog.remove(function(err) {
          if (err) {
            res.status(404);
            res.format({
              json: () => {
                res.json({error: err || 'Blog Post Not Found'});
              }
            });
          } else {
            res.status(200);
            res.format({
              json: () => {
                res.json(`The blog with the id ${blog._id} was removed`);
              }
            });
          }
        });
      }
    });
  }
};

module.exports = BlogHandler;
