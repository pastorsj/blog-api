'use strict'
const mongoose = require('mongoose');

/**
 * ROUTE: /:username
 */

const UserHandler = {
  get: function (req, res) {
    mongoose.model('User').findOne({
      username: req.params.username.toLowerCase()
    }, (err, user) => {
      if (err || user.length === 0) {
        err = new Error(err || 'User Not Found');
        res.status(404);
        res.format({
          json: () => {
            res.json({error: err})
          }
        });
      } else {
        res.status(200);
        res.format({
          json: () => {
            res.json(user)
          }
        });
      }
    });
  },
  put: function (req, res) {
    // mongoose.model('User').find({
    //   username: req.params.username.toLowerCase()
    // }, (err, user) => {
    //   if (err || user.length === 0) {
    //     err = new Error(err || 'User Not Found');
    //     res.status(404);
    //     res.format({
    //       json: () => {
    //         res.json({error: err})
    //       }
    //     });
    //   } else {
        
    //   }
    // });
  },
  delete: function (req, res) {

  }
};

module.export = UserHandler;