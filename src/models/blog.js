'use strict';

import mongoose from 'mongoose';

const blogPostScheme = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
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
