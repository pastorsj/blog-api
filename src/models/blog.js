

import mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

const blogPostSchema = new mongoose.Schema({
    datePosted: {
        type: Date,
        required: true,
        default: Date.now()
    },
    title: {
        type: String,
        required: true
    },
    description: {
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
        required: false,
        default: []
    },
    coverPhoto: {
        type: String,
        required: false,
        default: ''
    },
    isPublished: {
        type: Boolean,
        required: true,
        default: false
    }
});

blogPostSchema.plugin(autoIncrement, 'BlogPost');

const BlogPostModel = mongoose.model('BlogPost', blogPostSchema);

export default BlogPostModel;
