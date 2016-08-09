'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const md5 = require('blueimp-md5');

/**
 * ROUTE: login/
 */

const LoginHandler = {
  get: function(req, res) {
    mongoose.model('User').findOne({
      username: req.body.username
    }, (err, user) => {
      if (err || _.isEmpty(user)) {
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err || 'User Not Found'});
          }
        });
      } else if (user.password === md5(req.body.password)) {
        res.status(200);
        res.format({
          json: () => {
            res.json({message: 'Login Successful'});
          }
        });
      } else {
        res.status(500);
        res.format({
          json: () => {
            res.json({error: 'The username or password did not match'});
          }
        });
      }
    });
  }
};

module.exports = LoginHandler;
