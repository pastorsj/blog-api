var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false
  },
  name: {
    fname: {
      type: String,
      required: true
    },
    mname: {
      type: String,
      required: false,
      default: ""
    },
    lname: {
      type: String,
      required: true
    }
  },
  joinedDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  posts: {
    type: Array,
    required: false,
    default: []
  }
});

mongoose.model('User', userSchema);