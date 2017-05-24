'use strict';

import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config';

const userSchema = new mongoose.Schema({
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
    },
    salt: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        first: this.name,
        exp: parseInt(expiry.getTime() / 1000, 10)
    }, config.secret);
};


mongoose.model('User', userSchema);
