'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');

/**
 * ROUTE: user/:username
 */

const UserHandler = {
  get: function(req, res) {
    mongoose.model('User').findOne({
      username: req.params.username
    }, (err, user) => {
      if (err || _.isEmpty(user)) {
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err || 'User Not Found'});
          }
        });
      } else {
        res.status(200);
        res.format({
          json: () => {
            res.json(user);
          }
        });
      }
    });
  },
  put: function(req, res) {
    mongoose.model('User').findOne({
      username: req.params.username
    }, (err, user) => {
      if (err || _.isEmpty(user)) {
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err || 'User Not Found'});
          }
        });
      } else {
        _.assign(user, req.body);
        user.save(function(err) {
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
                res.json(user);
              }
            });
          }
        });
      }
    });
  },
  delete: function(req, res) {
    mongoose.model('User').findOne({
      username: req.params.username
    }, (err, user) => {
      if (err || _.isEmpty(user)) {
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err || 'User Not Found'});
          }
        });
      } else {
        user.remove(function(err) {
          if (err) {
            res.status(404);
            res.format({
              json: () => {
                res.json({error: err || 'User Not Found'});
              }
            });
          } else {
            res.status(200);
            res.format({
              json: () => {
                res.json(`The user with the username ${user.username} was removed`);
              }
            });
          }
        });
      }
    });
  }
};

module.exports = UserHandler;
