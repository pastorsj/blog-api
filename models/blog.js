'use strict';

const mongoose = require('mongoose');
const blogPostScheme = new mongoose.Schema({
  datePosted: {
    type: Date,
    required: true,
    default: Date.now()
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    required: false
  }
});

mongoose.model('BlogPost', blogPostScheme);
