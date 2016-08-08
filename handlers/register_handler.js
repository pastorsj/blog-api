'use strict';

const mongoose = require('mongoose');
const md5 = require('blueimp-md5');
const _ = require('lodash');
/**
 * ROUTE: register/
 */

const UserHandler = {
  get: function(req, res) {
    mongoose.model('User').findOne({
      username: req.body.username
    }, (err, user) => {
      if (err || user.length === 0) {
        err = new Error(err || 'User Not Found');
        res.status(404);
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
  },
  register: function(req, res) {
    mongoose.model('User').findOne({
      username: req.body.username
    }, (err, user) => {
      if (err) {
        res.status(500);
        res.format({
          json: () => {
            res.json({error: err});
          }
        });
      } else if (_.isEmpty(user)) {
        mongoose.model('User').create({
          username: req.body.username,
          password: md5(req.body.password),
          name: req.body.name,
          joinedDate: Date.now()
        }, (err, user) => {
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
                res.json({message: `The user with the ${req.body.username} was successfully created.`});
              }
            });
          }
        });
      } else {
        res.status(500);
        res.format({
          json: () => {
            res.json({error: `The user with username ${req.body.username} already exists.`});
          }
        });
      }
    });
  }
};

module.exports = UserHandler;
