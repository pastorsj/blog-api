

import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

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
    }
});

blogPostSchema.plugin(autoIncrement.plugin, 'Blog');

const BlogPostModel = mongoose.model('BlogPost', blogPostSchema);

export default BlogPostModel;
